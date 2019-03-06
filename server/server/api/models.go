package api

// BitcoinRPC used to speak to btcwallet and btcd
type BitcoinRPC interface {
	GetReceivedAmount(address string) (int64, error)
	AddAddress(address string) error
	IsValidAddress(address string) bool
}

// Invoice is an invoice to be saved in memory
type Invoice struct {
	DigitalValue int64
	FiatValue    int32
	Expiry       int64
	InvoiceID    string
}
