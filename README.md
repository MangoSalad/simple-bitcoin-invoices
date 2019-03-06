## Simple Bitcoin Invoice
##### Only for Testnet

## Components
* gRPC backend written in Go. Maintains api, invoice ledger, and key derivation.
* Envoy proxy service for protocol buffer messaging.
* Btcd bitcoin node implemenation by BtcSuite for indexing blockchain. Maintains communication with backend using websockets with TLS.
* BtcWallet golang wallet implementation by BtcSuite for maintaing balance ledger. Communication with websockets with TLS.
* Btcctl for manual testing over cli.
* Client is ReactJS frontend for issuing and viewing invoices.

## Technologies Used
* Go for backend.
* ReactJS for frontend.
* Protocol Buffers for messaging.
* Docker for deployment.

## Overview
Invoices are created in the backend using an extended public key. For each invoice request, a derivation index is incremented to get the associated public key. From there, a bitcoin address is encoded. The gRPC backend responds with invoice details using protocol buffers.

For checking invoice payments, the backend communicates with btcd over websockets. Address and transaction indexes are maintained on the node and is asked for transaction details upon request. Right now, price data is relied on blockchain.info.

gRPC was picked because of its ability to be interoperable with other services should this invoice system grow. In addition, it can scale better with requests due to less overhead and compressed messages. Safetly of messaging is maintained with types. 

Service can scale later by optimizing messages between the node<->backend and backend<->client. Few things would include websocket notifications so that client does not need to make requests so often. Long list of todo items.

## Functionality
* Create Invoice for XBT/USD pair.
* New address is generated for each invoice using extended public key.
* Invoice is timed with current time set to 15 minutes.
* Invoices have states including expired, paid, and partially_paid. Has an over_paid state as well, but no action is taken for over_paid invoices.
* Invoice balance updates as new payments arrive.

## Run
Running this code is very simple. You only need docker and docker-compose on your machine.

```make deploy```

Tests for server can be run<br>
```cd server/ && make test```

Protocol buffers for Javascript and Go can be generated<br>
```make js-protobuf```<br>
```make go-protobuf```

Compiling Go<br>
```make build```

React build<br>
```cd client && npm run-scripts build```

##### Includes dummy keys and certificates. Use Btcd's gencerts service to generate new keys for services.

## Manual Testing
The wallet.db for btcd is set up for testing. Just generate at least 101 blocks and then begin sending bitcoin to invoices. To do so, enter the btcd image and use btcctl to interact with regression test.

```docker exec -it <btcd_image> bash```

```btcctl --testnet --rpcuser=user --rpcpass=password --rpccert=/root/.btcwallet/rpc.cert --rpcserver=btcwallet:18332 --wallet walletpassphrase test 10000```

```btcctl --testnet --rpcuser=user --rpcpass=password --rpccert=/root/.btcd/rpc.cert --rpcserver=btcwallet:18332 generate <numBlocks>```

```btcctl --testnet  --rpcuser=user --rpcpass=password --rpccert=/root/.btcwallet/rpc.cert --rpcserver=btcwallet:18332  sendtoaddress <addy> <amount>```

To list more options:<br>
```btcctl --testnet --rpcuser=user --rpcpass=password --rpccert=/root/.btcd/rpc.cert --rpcserver=btcwallet:18332 -l```

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
* With websockets, enable notifications for payments.

## Example
![Creating an invoice.](docs/misc/createinvoice.png "Creating an invoice.")
<br>
![Showing an invoice.](docs/misc/showinvoice.png "Showing an invoice.")

