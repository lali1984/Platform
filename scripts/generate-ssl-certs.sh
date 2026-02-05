#!/bin/bash
# generate-ssl-certs.sh

set -e

echo "Generating SSL certificates for production..."

# Create directory
mkdir -p ./00_infrastructure/api-gateway/ssl
cd ./00_infrastructure/api-gateway/ssl

# Generate CA private key
openssl genrsa -out ca.key 4096

# Generate CA certificate
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/C=US/ST=California/L=San Francisco/O=Platform Ecosystem/CN=Platform Ecosystem CA"

# Generate server private key
openssl genrsa -out platform-ecosystem.key 2048

# Generate CSR
openssl req -new -key platform-ecosystem.key -out platform-ecosystem.csr \
  -subj "/C=US/ST=California/L=San Francisco/O=Platform Ecosystem/CN=platform-ecosystem.com" \
  -addext "subjectAltName = DNS:platform-ecosystem.com, DNS:www.platform-ecosystem.com, DNS:localhost"

# Sign certificate
openssl x509 -req -days 365 -in platform-ecosystem.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out platform-ecosystem.crt -extfile <(printf "subjectAltName=DNS:platform-ecosystem.com,DNS:www.platform-ecosystem.com,DNS:localhost")

# Generate DH parameters
openssl dhparam -out dhparam.pem 2048

# Set permissions
chmod 600 *.key
chmod 644 *.crt *.pem

echo "✅ SSL certificates generated:"
echo "   - platform-ecosystem.crt (server certificate)"
echo "   - platform-ecosystem.key (private key)"
echo "   - ca.crt (CA certificate)"
echo "   - dhparam.pem (DH parameters)"

# For production, you should obtain certificates from Let's Encrypt:
# certbot certonly --standalone -d platform-ecosystem.com -d www.platform-ecosystem.com