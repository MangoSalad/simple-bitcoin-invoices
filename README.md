## Simple Bitcoin Invoice

## Components
* gRPC backend written in Go. Maintains api, invoice ledger, and key derivation.
* Envoy proxy service for protocol buffer messaging.
* Btcd bitcoin node implemenation by BtcSuite for indexing blockchain. Maintains communication with backend using websockets with TLS.
* BtcWallet golang wallet implementation by BtcSuite for maintaing balance ledger. Communication with websockets with TLS.
* Btcctl for manual testing over cli.
* Client is ReactJS frontend for issuing and viewing invoices.

## Implementation Decisions
grpc server can stand alone as a backend to the frontend or for other clients.
Responsive UI.

## Run
```make deploy```

Tests for server can be run with <br>
```make test```

## TODO
* Configuration file for backend that configures extended public key, confirmation policy, network configuration.
* Frontend testing.
* Certificate exchange for TLS websocket communication for bitcoin nodes and backend.
* Persistent memory for wallet.db and backend invoice ledger.
* Better understanding of situation when invoices are overpaid.
* Prevent payee from maliciously sending smaller inputs that can become unspendable.
* With the design, pretty straightforward to support alt coins.
* Endpoint that allows merchant to request derivation paths of invoices.
* Description fields for invoices.
