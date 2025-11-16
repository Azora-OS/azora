# OWASP Top 10 Security Checklist

## A01:2021 – Broken Access Control

- [ ] Implement role-based access control (RBAC)
- [ ] Validate user permissions on every request
- [ ] Prevent directory traversal attacks
- [ ] Disable directory listing
- [ ] Enforce least privilege principle

## A02:2021 – Cryptographic Failures

- [ ] Use TLS 1.3 for all connections
- [ ] Encrypt sensitive data at rest
- [ ] Use strong encryption algorithms (AES-256)
- [ ] Secure key management
- [ ] Hash passwords with bcrypt/argon2

## A03:2021 – Injection

- [ ] Use parameterized queries (Prisma ORM)
- [ ] Validate and sanitize all inputs
- [ ] Implement input length limits
- [ ] Use prepared statements
- [ ] Escape special characters

## A04:2021 – Insecure Design

- [ ] Implement threat modeling
- [ ] Use secure design patterns
- [ ] Separate concerns properly
- [ ] Implement defense in depth
- [ ] Regular security reviews

## A05:2021 – Security Misconfiguration

- [ ] Remove default credentials
- [ ] Disable unnecessary features
- [ ] Keep dependencies updated
- [ ] Implement security headers
- [ ] Regular security audits

## A06:2021 – Vulnerable Components

- [ ] Run npm audit daily
- [ ] Update dependencies regularly
- [ ] Monitor CVE databases
- [ ] Use Dependabot/Snyk
- [ ] Remove unused dependencies

## A07:2021 – Authentication Failures

- [ ] Implement MFA
- [ ] Use secure session management
- [ ] Implement rate limiting
- [ ] Strong password policies
- [ ] Account lockout mechanisms

## A08:2021 – Software and Data Integrity

- [ ] Verify digital signatures
- [ ] Use CI/CD pipeline security
- [ ] Implement code signing
- [ ] Verify dependencies
- [ ] Use SRI for CDN resources

## A09:2021 – Logging and Monitoring

- [ ] Log security events
- [ ] Monitor for anomalies
- [ ] Implement alerting
- [ ] Secure log storage
- [ ] Regular log review

## A10:2021 – Server-Side Request Forgery

- [ ] Validate URLs
- [ ] Whitelist allowed domains
- [ ] Disable HTTP redirects
- [ ] Network segmentation
- [ ] Input validation

## Audit Schedule

- **Daily**: Automated scans (npm audit)
- **Weekly**: Dependency updates
- **Monthly**: Manual security review
- **Quarterly**: Penetration testing
- **Annually**: Full security audit
