js-protobuf: protoc --js_out=import_style=commonjs,binary:client/src/ --grpc-web_out=import_style=commonjs,mode=grpcwebtext:client/src/ protobuf/*.proto

go-protobuf: protoc --go_out=plugins=grpc:server/server/ protobuf/*.proto 