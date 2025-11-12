# SSL Certificates

Place your SSL certificates here:

- `azora.world.crt` - SSL certificate
- `azora.world.key` - Private key

## Generate Self-Signed (Development)
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout azora.world.key \
  -out azora.world.crt \
  -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Azora/CN=azora.world"
```

## Production SSL
Use Let's Encrypt or your SSL provider certificates.