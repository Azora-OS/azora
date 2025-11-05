# Organs

This directory contains system organs - specialized services that perform specific functions within the Azora OS ecosystem.

## Organ Structure

Each organ should follow the standard structure defined in [docs/STRUCTURE_STANDARDS.md](../docs/STRUCTURE_STANDARDS.md).

## Standard Organs

### API Gateway
Main API gateway for routing requests.

### Authentication & Authorization
- `auth/` - Authentication service
- `federated-identity/` - Federated identity management

### Compliance
- `compliance/` - General compliance service
- `compliance-service/` - Advanced compliance engine
- `gdpr-compliance/` - GDPR compliance
- `hipaa-compliance/` - HIPAA compliance
- Various country-specific compliance services

### Communication
- `messaging/` - Messaging service
- `email-hosting/` - Email hosting service
- `notification-service/` - Notification service

### Infrastructure
- `api-gateway/` - API gateway
- `monitoring/` - System monitoring
- `service-registry/` - Service registry

### Security
- `vigil-service/` - Security monitoring
- `security-camera/` - Security camera integration
- `biometrics/` - Biometric authentication

### Logistics
- `procurement-corridor/` - Procurement services
- `cold-chain-quantum/` - Cold chain management
- `quantum-iot-integration/` - Quantum IoT integration

## Organ Standards

All organs must have:
- `README.md` - Organ documentation
- `package.json` - Dependencies and scripts
- `index.js` - Main entry point

See [docs/STRUCTURE_STANDARDS.md](../docs/STRUCTURE_STANDARDS.md) for complete structure requirements.

## Adding a New Organ

1. Create organ directory: `organs/your-organ-name/`
2. Add required files: `README.md`, `package.json`, `index.js`
3. Follow standard structure from `docs/STRUCTURE_STANDARDS.md`
4. Update this README to list your organ
