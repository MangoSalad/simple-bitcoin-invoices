FROM golang:1.11-stretch

WORKDIR /server

COPY build/server .
COPY utils/rpc.cert .

COPY utils/rpc.cert /usr/share/ca-certificates/btcd.crt
RUN echo btcd.crt >> /etc/ca-certificates.conf
RUN update-ca-certificates

EXPOSE 9090
ENTRYPOINT ./server