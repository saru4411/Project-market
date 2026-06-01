# Stage 1: Build the Go binary
FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o compute-service .

# Stage 2: Light production runner
FROM alpine:3.19
# install minimal tools required for healthchecks and TLS
RUN apk add --no-cache wget ca-certificates
WORKDIR /app
COPY --from=builder /app/compute-service .
EXPOSE 8080
CMD ["./compute-service"]
