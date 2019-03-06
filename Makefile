# js-protobuf: protoc --js_out=import_style=commonjs,binary:client/src/ --grpc-web_out=import_style=commonjs,mode=grpcwebtext:client/src/ protobuf/*.proto
# go-protobuf: protoc --go_out=plugins=grpc:server/server/ protobuf/*.proto 
docker-build:
	docker-compose build

docker-run:
	docker-compose up

deploy: docker-build docker-run