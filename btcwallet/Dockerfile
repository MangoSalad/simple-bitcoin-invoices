FROM golang:1.11-stretch

WORKDIR $GOPATH/src/github.com/btcsuite/btcwallet

RUN git clone https://github.com/MangoSalad/btcwallet.git .
RUN GO111MODULE=on go install -v . ./cmd/...

RUN mkdir /root/.btcwallet && mkdir /root/.btcctl

COPY rpc.cert /root/.btcwallet/
COPY rpc.key /root/.btcwallet/

COPY rpc.cert /usr/share/ca-certificates/btcd.crt
RUN echo btcd.crt >> /etc/ca-certificates.conf
RUN update-ca-certificates

WORKDIR /root

COPY wallet.db regtest/
COPY btcwallet.conf .

EXPOSE 18332
CMD ls
ENTRYPOINT btcwallet --testnet -u=user -P=password --rpcconnect=btcd:18334 --rpclisten=0.0.0.0 --rpccert=/root/.btcwallet/rpc.cert --rpckey=/root/.btcwallet/rpc.key --btcdusername=user --btcdpassword=password --debuglevel=debug --appdata=/root ----walletpass="test"