build: build-api

build-api:
	go build -o build/server cmd/invoice-app/main.go

build-linux-api:
	env GOOS=linux GOARCH=arm go build -o build/server cmd/invoice-app/main.go

test:
	go test -v tests/api_test.go

run: build; ./build/server