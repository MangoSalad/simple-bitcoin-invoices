package test

import (
	api "bitcoin-invoice/server/api"
	pb "bitcoin-invoice/server/protobuf"
	"context"
	"log"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockBitcoinNode struct {
	mock.Mock
}

func (m *MockBitcoinNode) GetReceivedAmount(address string) (int64, error) {
	log.Printf("GetReceivedAmount %s", address)
	args := m.Called(address)
	return args.Get(0).(int64), nil
}

func (m *MockBitcoinNode) AddAddress(address string) error {
	log.Printf("AddAddress %s", address)
	return nil
}

func (m *MockBitcoinNode) IsValidAddress(address string) bool {
	log.Printf("IsValidAddress %s", address)
	args := m.Called(address)
	return args.Get(0).(bool)
}

// Tests overall lifecycle of an invoice
// 1. Create Invoice, expect same fiat value
// 2. Check Invoice, expect unpaid
// 3. Get Invoice, expect same response as step 1
// 4. Pay the invoice partially and check invoice response, expect partially_paid.
// 5. Pay invoice in full, expect paid response
func TestInvoiceLifeycle(t *testing.T) {
	dummyNode := &MockBitcoinNode{}
	xpub := "tpubDEi5zVje5GJjmQV2iBNPnJpPk8QWmhpT6jxUTwTem9YtRkdj4bSjFd8NTzWemYx7YRdKwZxebcw85jLaB8QrybiniPsfvQaNDXhVeC7vdiH"

	// 1: create invoice
	s := api.Server{Invoices: make(map[string]*api.Invoice), DerivationIndex: 0, Bitcoin: dummyNode, Xpub: xpub}
	reqInvoice := &pb.InvoiceRequest{Value: 3200}
	respInvoice, err := s.CreateInvoice(context.Background(), reqInvoice)

	assert.NoError(t, err)
	assert.Equal(t, int32(3200), respInvoice.FiatValue)

	// mock the response, address owns 0 utxo
	dummyNode.On("IsValidAddress", respInvoice.InvoiceId).Return(true).Once()
	dummyNode.On("GetReceivedAmount", respInvoice.InvoiceId).Return(int64(0), nil).Once()

	// 2: check invoice
	reqInvoiceCheck := &pb.InvoiceCheckRequest{InvoiceId: respInvoice.InvoiceId}
	resInvoiceCheck, err := s.CheckInvoice(context.Background(), reqInvoiceCheck)
	assert.NoError(t, err)
	assert.Equal(t, "unpaid", resInvoiceCheck.Status)

	// 3: get invoice
	reqGetInvoice := &pb.InvoiceGetRequest{InvoiceId: respInvoice.InvoiceId}
	respGetInvoice, err := s.GetInvoice(context.Background(), reqGetInvoice)
	assert.NoError(t, err)
	assert.Equal(t, respInvoice.FiatValue, respGetInvoice.FiatValue)
	assert.Equal(t, respInvoice.InvoiceId, respGetInvoice.InvoiceId)
	assert.Equal(t, respInvoice.DigitalValue, respGetInvoice.DigitalValue)
	assert.Equal(t, respInvoice.Expiry, respGetInvoice.Expiry)

	// 4: pay invoice partially

	// mock the response, address owns some utxo
	dummyNode.On("IsValidAddress", respInvoice.InvoiceId).Return(true).Once()
	dummyNode.On("GetReceivedAmount", respInvoice.InvoiceId).Return(int64(respGetInvoice.DigitalValue-int64(500000)), nil).Once()
	reqInvoiceCheck2 := &pb.InvoiceCheckRequest{InvoiceId: respInvoice.InvoiceId}
	resInvoiceCheck2, err := s.CheckInvoice(context.Background(), reqInvoiceCheck2)
	assert.NoError(t, err)
	assert.Equal(t, "partially_paid", resInvoiceCheck2.Status)

	// 5: pay all of it
	dummyNode.On("IsValidAddress", respInvoice.InvoiceId).Return(true).Once()
	dummyNode.On("GetReceivedAmount", respInvoice.InvoiceId).Return(int64(respGetInvoice.DigitalValue), nil).Once()
	reqInvoiceCheck3 := &pb.InvoiceCheckRequest{InvoiceId: respInvoice.InvoiceId}
	resInvoiceCheck3, err := s.CheckInvoice(context.Background(), reqInvoiceCheck3)
	assert.NoError(t, err)
	assert.Equal(t, "paid", resInvoiceCheck3.Status)
}

// Check for junky invoices
func TestFailInvoiceCreate(t *testing.T) {
	dummyNode := &MockBitcoinNode{}
	xpub := "tpubDEi5zVje5GJjmQV2iBNPnJpPk8QWmhpT6jxUTwTem9YtRkdj4bSjFd8NTzWemYx7YRdKwZxebcw85jLaB8QrybiniPsfvQaNDXhVeC7vdiH"

	s := api.Server{Invoices: make(map[string]*api.Invoice), DerivationIndex: 0, Bitcoin: dummyNode, Xpub: xpub}
	reqInvoice1 := &pb.InvoiceRequest{Value: 0}
	_, err := s.CreateInvoice(context.Background(), reqInvoice1)

	assert.Error(t, err, "invalid invoice value")
}

// check for invalid invoice id
func TestFailInvoiceCheck(t *testing.T) {
	dummyNode := &MockBitcoinNode{}
	xpub := "tpubDEi5zVje5GJjmQV2iBNPnJpPk8QWmhpT6jxUTwTem9YtRkdj4bSjFd8NTzWemYx7YRdKwZxebcw85jLaB8QrybiniPsfvQaNDXhVeC7vdiH"

	// check fake invoice
	s := api.Server{Invoices: make(map[string]*api.Invoice), DerivationIndex: 0, Bitcoin: dummyNode, Xpub: xpub}
	dummyNode.On("IsValidAddress", "blahblah").Return(false).Once()
	reqInvoiceCheck1 := &pb.InvoiceCheckRequest{InvoiceId: "blahblah"}
	_, err := s.CheckInvoice(context.Background(), reqInvoiceCheck1)
	assert.Error(t, err, "cannot find invoice for blahblah")
}

// Testing paying 6% than required, expect partially_paid
func TestPartiallyPaidInvoice(t *testing.T) {
	dummyNode := &MockBitcoinNode{}
	xpub := "tpubDEi5zVje5GJjmQV2iBNPnJpPk8QWmhpT6jxUTwTem9YtRkdj4bSjFd8NTzWemYx7YRdKwZxebcw85jLaB8QrybiniPsfvQaNDXhVeC7vdiH"
	s := api.Server{Invoices: make(map[string]*api.Invoice), DerivationIndex: 0, Bitcoin: dummyNode, Xpub: xpub}

	// invoice for 3200
	reqInvoice := &pb.InvoiceRequest{Value: 3200}
	respInvoice, err := s.CreateInvoice(context.Background(), reqInvoice)

	assert.NoError(t, err)
	assert.Equal(t, int32(3200), respInvoice.FiatValue)

	btcRequested := respInvoice.DigitalValue
	sixPercentOfTotal := (int64)(float64(btcRequested) * 0.06)

	// pay 6% less than total
	dummyNode.On("IsValidAddress", respInvoice.InvoiceId).Return(true).Once()
	dummyNode.On("GetReceivedAmount", respInvoice.InvoiceId).Return(btcRequested-sixPercentOfTotal, nil).Once()
	reqInvoiceCheck1 := &pb.InvoiceCheckRequest{InvoiceId: respInvoice.InvoiceId}
	resInvoiceCheck1, err := s.CheckInvoice(context.Background(), reqInvoiceCheck1)
	assert.NoError(t, err)
	assert.Equal(t, "partially_paid", resInvoiceCheck1.Status)

	twoPercentOfTotal := (int64)(float64(btcRequested) * 0.02)

	// pay 2% less than total, this should go through
	dummyNode.On("IsValidAddress", respInvoice.InvoiceId).Return(true).Once()
	dummyNode.On("GetReceivedAmount", respInvoice.InvoiceId).Return(btcRequested-twoPercentOfTotal, nil).Once()
	reqInvoiceCheck2 := &pb.InvoiceCheckRequest{InvoiceId: respInvoice.InvoiceId}
	resInvoiceCheck2, err := s.CheckInvoice(context.Background(), reqInvoiceCheck2)
	assert.NoError(t, err)
	assert.Equal(t, "paid", resInvoiceCheck2.Status)
}
