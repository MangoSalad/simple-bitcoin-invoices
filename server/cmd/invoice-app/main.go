package main

import (
	"fmt"
	"log"
	"net"

	api "bitcoin-invoice/server/api"
	btc "bitcoin-invoice/server/bitcoin"
	pb "bitcoin-invoice/server/protobuf"

	"google.golang.org/grpc"
)

const (
	port = ":9090"
	xpub = "tpubDEi5zVje5GJjmQV2iBNPnJpPk8QWmhpT6jxUTwTem9YtRkdj4bSjFd8NTzWemYx7YRdKwZxebcw85jLaB8QrybiniPsfvQaNDXhVeC7vdiH"
)

func main() {
	fmt.Printf("listening on %s\n", port)
	listen, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// init bitcoin node
	node := &btc.Bitcoinrpc{BitcoinUser: "user", BitcoinPass: "password"}
	node.InitRpcConnection()

	// start grpc backend
	s := grpc.NewServer()
	api := &api.Server{Invoices: make(map[string]*api.Invoice), DerivationIndex: 0, Xpub: xpub, Bitcoin: node}
	pb.RegisterInvoiceServer(s, api)

	if err := s.Serve(listen); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
