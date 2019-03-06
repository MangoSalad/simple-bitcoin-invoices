package api

import (
	pb "bitcoin-invoice/server/protobuf"
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/btcsuite/btcd/chaincfg"
	keychain "github.com/btcsuite/btcutil/hdkeychain"
)

// Server type manages handlers for api. Includes DerivationIndex in memory to keep track of xpub derivations. @TODO - write it to disk for persistence
type Server struct {
	DerivationIndex uint32
	Xpub            string
	Invoices        map[string]*Invoice
	Bitcoin         BitcoinRPC
}

// CreateInvoice registers service to create invoices
func (s *Server) CreateInvoice(ctx context.Context, in *pb.InvoiceRequest) (*pb.InvoiceResponse, error) {
	log.Printf("Requesting invoice for: %d", in.Value)

	// invoice must be greater than 0
	if in.Value <= 0 {
		return nil, errors.New("invalid invoice value")
	}

	// construct the invoice, get xbt/usd pair, expiry timestamp, and next unique address in derivation path.
	digitalValue, err := s.getPrice(in.Value)
	if err != nil {
		return nil, err
	}

	expiry := s.getExpiry()

	address, err := s.deriveAddress()
	if err != nil {
		return nil, err
	}

	log.Printf("invoice created for %s", address)

	// Add to memory
	s.Invoices[address] = &Invoice{
		DigitalValue: digitalValue,
		FiatValue:    in.Value,
		Expiry:       expiry,
		InvoiceID:    address}

	// @TODO, node currently indexes all addresses. reduce complexity by adding watch-only addresses

	// return the protobuf message
	invoice := s.createInvoiceResponseProtobuf(in.Value, digitalValue, expiry, address)
	return invoice, nil
}

// deriveAddress derives address at the current DerivationIndex
func (s *Server) deriveAddress() (string, error) {
	// generate keychain
	extKey, err := keychain.NewKeyFromString(s.Xpub)
	if err != nil {
		log.Printf("problem creating keychain for %s", s.Xpub)
		return "", fmt.Errorf("problem creating keychain for %s", s.Xpub)
	}

	// create child at provided index
	extPubKey, err := extKey.Child(s.DerivationIndex)
	if err != nil {
		log.Printf("problem creating child for %s at index %v", s.Xpub, s.DerivationIndex)
		return "", fmt.Errorf("problem creating child for %s at index %v", s.Xpub, s.DerivationIndex)
	}

	// derive address to p2pkh @TODO - make config for changing network params, can later support alt coins
	address, err := extPubKey.Address(&chaincfg.TestNet3Params)
	if err != nil {
		log.Printf("problem creating address for %s at index %v", s.Xpub, s.DerivationIndex)
		return "", fmt.Errorf("problem creating address for %s at index %v", s.Xpub, s.DerivationIndex)
	}

	log.Printf("generated address %s at index %d", address.String(), s.DerivationIndex)
	// increment
	s.DerivationIndex++

	return address.String(), nil
}

// getExpiry sets a 15 minute expiry time for an invoice
func (s *Server) getExpiry() int64 {
	now := time.Now().UTC()
	log.Printf("start time for invoice is %v", now)
	expiry := now.Add(time.Minute * time.Duration(15))
	log.Printf("expiry time for invoice is %v", expiry)

	return expiry.Unix()
}

// getPrice queries blockchain.com for market price for pair XBT/USD
func (s *Server) getPrice(fiatValue int32) (int32, error) {
	req, err := http.NewRequest("GET", "https://blockchain.com/tobtc", nil)
	if err != nil {
		log.Printf("cannot build request for xbt/usd : %v", err)
		return 0, fmt.Errorf("cannot build request for xbt/usd")
	}

	// integer to float
	fiat := float64(fiatValue / 100.0)
	query := req.URL.Query()
	query.Add("currency", "USD")
	// truncate to 2 decimal places
	query.Add("value", fmt.Sprintf("%.2f", fiat))
	req.URL.RawQuery = query.Encode()

	log.Printf("sending request to %s", req.URL.String())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("cannot request %s", req.URL.String())
		return 0, fmt.Errorf("cannot build request for xbt/usd")
	}
	defer resp.Body.Close()

	if resp.Status != "200 OK" {
		log.Printf("response body not OK. cannot request %s", req.URL.String())
		return 0, fmt.Errorf("cannot build request for xbt/usd")
	}

	body, _ := ioutil.ReadAll(resp.Body)
	log.Printf("Received %s", string(body))
	digitalFloatValue, err := strconv.ParseFloat(string(body), 64)
	if err != nil {
		log.Printf("could not parse %s", string(body))
		return 0, fmt.Errorf("cannot build request for xbt/usd")
	}

	// convert to satoshis
	digitalValue := digitalFloatValue * math.Pow10(8)
	log.Printf("Satoshi value %d", int(digitalValue))

	return int32(digitalValue), nil
}

// createInvoiceResponseProtobuf creates an InvoiceResponse protocol buffer
func (s *Server) createInvoiceResponseProtobuf(fiatValue, digitalValue int32, expiry int64, invoiceID string) *pb.InvoiceResponse {
	return &pb.InvoiceResponse{FiatValue: fiatValue, DigitalValue: digitalValue, Expiry: expiry, InvoiceId: invoiceID}
}

// CheckInvoice registers service to check status of invoices
func (s *Server) CheckInvoice(ctx context.Context, in *pb.InvoiceCheckRequest) (*pb.InvoiceCheckResponse, error) {
	log.Printf("Request invoice check for: %v", in.InvoiceId)

	// validate address
	if !s.Bitcoin.IsValidAddress(in.InvoiceId) {
		return nil, fmt.Errorf("could not invoice for %s", in.InvoiceId)
	}

	// appropriate interval for which a bitcoin amount is considered paid. @TODO - make this a config option
	allowedIntervalPercentage := 0.02 //within 2% of payment

	// check if real invoice
	invoice, ok := s.Invoices[in.InvoiceId]
	if !ok {
		return nil, fmt.Errorf("could not invoice for %s", in.InvoiceId)
	} else {

		// if expired already, dont check btcd
		var statusResponse *pb.InvoiceCheckResponse
		if time.Now().UTC().Unix() > s.Invoices[in.InvoiceId].Expiry {
			statusResponse = s.createInvoiceCheckResponseProtobuf("expired", 0)
			return statusResponse, nil
		}

		// connect to bitcoind and check
		amountPaid, err := s.Bitcoin.GetReceivedAmount(in.InvoiceId)
		if err != nil {
			return nil, fmt.Errorf("could not check balance for %s", in.InvoiceId)
		}

		amountToPay := invoice.DigitalValue
		allowedInterval := (int32)(float64(amountToPay) * allowedIntervalPercentage)

		// within 2% range of payment
		if amountPaid <= amountToPay+allowedInterval && amountPaid >= amountToPay-allowedInterval {
			// paid within range amountToPay ±2%
			statusResponse = s.createInvoiceCheckResponseProtobuf("paid", 0)
		} else if amountPaid == 0 {
			// not paid at all
			statusResponse = s.createInvoiceCheckResponseProtobuf("unpaid", amountToPay)
		} else if amountPaid < amountToPay-allowedInterval {
			// partially paid
			statusResponse = s.createInvoiceCheckResponseProtobuf("partially_paid", amountToPay-amountPaid)
		} else if amountPaid > amountToPay+allowedInterval {
			// overpaid
			statusResponse = s.createInvoiceCheckResponseProtobuf("over_paid", 0)
		}

		return statusResponse, nil
	}
}

// createInvoiceCheckResponseProtobuf creates a checkresponse protocol buffer for checking statuses of invoices
func (s *Server) createInvoiceCheckResponseProtobuf(status string, amountToPay int32) *pb.InvoiceCheckResponse {
	return &pb.InvoiceCheckResponse{Status: status, DigitalValueRemaining: amountToPay}
}

// GetInvoice returns an invoice if we have it in memory.
func (s *Server) GetInvoice(ctx context.Context, in *pb.InvoiceGetRequest) (*pb.InvoiceResponse, error) {
	log.Printf("Request invoice get for: %v", in.InvoiceId)
	invoice, ok := s.Invoices[in.InvoiceId]
	if !ok {
		return nil, fmt.Errorf("cannot find invoice for %s", in.InvoiceId)
	}

	return &pb.InvoiceResponse{FiatValue: invoice.FiatValue, DigitalValue: invoice.DigitalValue, Expiry: invoice.Expiry, InvoiceId: invoice.InvoiceID}, nil
}

// @TODO - would be nice to have notifications for websockets.
