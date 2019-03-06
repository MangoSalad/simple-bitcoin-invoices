FROM golang:1.11-stretch

WORKDIR $GOPATH/src/github.com/btcsuite/btcd

RUN git clone https://github.com/btcsuite/btcd . \
	&&  GO111MODULE=on go install -v . ./cmd/...

RUN mkdir /root/.btcd && mkdir /root/.btcctl

COPY btcd.conf /root/.btcd/

WORKDIR /root

COPY rpc.cert /root/.btcd/
COPY rpc.cert /root/.btcwallet/
COPY rpc.key /root/.btcd/
RUN touch /root/.btcwallet/btcwallet.conf

COPY rpc.cert /usr/share/ca-certificates/btcd.crt
RUN echo btcd.crt >> /etc/ca-certificates.conf
RUN update-ca-certificates

EXPOSE 18334 18444
ENTRYPOINT btcd --regtest -u=user -P=password --addrindex --txindex --configfile="/root/.btcd/btcd.conf" --rpclisten=0.0.0.0 --rpccert=/root/.btcd/rpc.cert --rpckey=/root/.btcd/rpc.key --configfile=/root/.btcd/btcd.conf --miningaddr=muENVaKhU1bnMGAg8SzWj2mBScckcThSSi