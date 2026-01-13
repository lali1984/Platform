# Platform Testing Documentation

## Test Structure
tests/
├── integration/ # Integration tests
│ ├── gateway-api.test.sh
│ └── 2fa-test.sh
├── performance/ # Performance tests
│ └── load-test.sh
└── security/ # Security tests
└── security-scan.sh

text

## Running Tests

### Individual Tests
```bash
# Integration tests
./tests/integration/gateway-api.test.sh

# 2FA tests  
./tests/integration/2fa-test.sh

# Performance tests
./tests/performance/load-test.sh

# Security tests
./tests/security/security-scan.sh
