# Azora OS Test Suite

## Email Hosting & Authentication Tests

Comprehensive test coverage for:
- ✅ Email hosting with quantum-resistant encryption
- ✅ Zero-knowledge proof authentication
- ✅ Multi-party computation for MFA
- ✅ Blockchain audit trails
- ✅ Homomorphic encryption for data privacy
- ✅ Intelligence-level security validation

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test email-auth-integration.test.ts
```

## Environment Setup

Create `.env` file:
```env
COVENANT_URL=http://localhost:3009
AUTH_URL=http://localhost:3001
EMAIL_USER=admin@azora.africa
EMAIL_PASS=your_secure_password
```

## Test Coverage

- **Email Hosting**: Quantum encryption, secure transactions
- **Authentication**: ZKP, MPC sessions, threshold signatures
- **Security**: Audit trails, integrity verification
- **Access Control**: Range proofs, permission validation

## Security Features Tested

1. **Quantum-Resistant Cryptography** (Kyber768)
2. **Zero-Knowledge Proofs** (ZKP)
3. **Multi-Party Computation** (MPC)
4. **Homomorphic Encryption** (Paillier)
5. **Blockchain Ledger** (Immutable audit trail)
6. **Threshold Cryptography** (2-of-3 signatures)

## Ubuntu Philosophy Integration

All tests align with Ubuntu principles:
- *"My security ensures our freedom"*
- Collective protection through distributed trust
- Transparent audit trails for community accountability
