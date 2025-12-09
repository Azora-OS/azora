# Code Signing Guide for AzStudio

This guide explains how to set up code signing for AzStudio Windows builds.

## Why Code Signing?

Code signing provides several benefits:

1. **Trust**: Users can verify the software comes from Azora
2. **Security**: Prevents tampering and malware injection
3. **SmartScreen**: Reduces or eliminates Windows SmartScreen warnings
4. **Reputation**: Builds trust with Microsoft's reputation system

## Certificate Types

### EV (Extended Validation) Code Signing Certificate
**Recommended for production**

- **Pros**:
  - Immediate SmartScreen reputation
  - No warnings for users
  - Highest trust level
  - Required for kernel-mode drivers

- **Cons**:
  - More expensive ($300-500/year)
  - Requires hardware token (USB)
  - Longer validation process

- **Providers**:
  - DigiCert
  - Sectigo (formerly Comodo)
  - GlobalSign

### Standard Code Signing Certificate
**Good for initial releases**

- **Pros**:
  - Less expensive ($100-200/year)
  - Software-based (PFX file)
  - Faster to obtain

- **Cons**:
  - SmartScreen warnings until reputation is built
  - Requires time to build trust
  - Users may see "Unknown publisher" warnings

- **Providers**:
  - DigiCert
  - Sectigo
  - SSL.com
  - Certum

### Self-Signed Certificate
**Development and testing only**

- **Pros**:
  - Free
  - Instant creation
  - Good for internal testing

- **Cons**:
  - Security warnings for all users
  - Not trusted by Windows
  - Only for development

## Obtaining a Certificate

### Step 1: Choose a Provider
Research and select a Certificate Authority (CA):
- Compare prices and validation requirements
- Check renewal policies
- Verify Windows compatibility

### Step 2: Validation Process
Prepare required documents:
- Business registration documents
- Tax ID or DUNS number
- Domain ownership verification
- Phone verification

### Step 3: Certificate Delivery
- **EV Certificate**: Shipped on USB token
- **Standard Certificate**: Downloaded as PFX file
- Save certificate securely
- Backup certificate and password

## Setting Up Code Signing

### For Production Builds

1. **Store Certificate Securely**
   ```bash
   # Create secure directory
   mkdir C:\Certificates
   
   # Copy certificate
   copy certificate.pfx C:\Certificates\azstudio.pfx
   
   # Set restrictive permissions
   icacls C:\Certificates\azstudio.pfx /inheritance:r /grant:r "%USERNAME%:R"
   ```

2. **Set Environment Variables**
   
   **Windows Command Prompt:**
   ```cmd
   set CSC_LINK=C:\Certificates\azstudio.pfx
   set CSC_KEY_PASSWORD=your_secure_password
   ```
   
   **PowerShell:**
   ```powershell
   $env:CSC_LINK="C:\Certificates\azstudio.pfx"
   $env:CSC_KEY_PASSWORD="your_secure_password"
   ```
   
   **Permanent (System Environment Variables):**
   - Open System Properties → Advanced → Environment Variables
   - Add User Variables:
     - `CSC_LINK`: `C:\Certificates\azstudio.pfx`
     - `CSC_KEY_PASSWORD`: `your_secure_password`

3. **Build with Signing**
   ```bash
   npm run package
   ```
   
   electron-builder will automatically sign the executables.

### For Development Builds

Create a self-signed certificate for testing:

```bash
node scripts/sign.js --create-dev-cert
```

This creates a development certificate at `build/dev-cert.pfx` with password `development`.

**Set environment variables:**
```bash
set CSC_LINK=build\dev-cert.pfx
set CSC_KEY_PASSWORD=development
```

**⚠️ Warning**: Self-signed certificates will show security warnings to users.

## Manual Signing

If you need to sign files manually:

```bash
# Sign a file
node scripts/sign.js

# Sign and verify
node scripts/sign.js --verify
```

The script will:
1. Find all `.exe` files in the `release` directory
2. Sign them with your certificate
3. Use timestamp servers for long-term validity
4. Optionally verify signatures

## Timestamp Servers

Timestamps ensure signatures remain valid after certificate expiration.

The signing script uses these timestamp servers (with fallback):
1. DigiCert: `http://timestamp.digicert.com`
2. Sectigo: `http://timestamp.comodoca.com`
3. Sectigo Alt: `http://timestamp.sectigo.com`
4. GlobalSign: `http://timestamp.globalsign.com`

## Verifying Signatures

### Using Windows Explorer
1. Right-click the `.exe` file
2. Select "Properties"
3. Go to "Digital Signatures" tab
4. Verify signature details

### Using Command Line
```bash
# Verify signature
signtool verify /pa AzStudio-Setup-0.1.0.exe

# View signature details
signtool verify /v /pa AzStudio-Setup-0.1.0.exe
```

### Using PowerShell
```powershell
Get-AuthenticodeSignature .\AzStudio-Setup-0.1.0.exe | Format-List
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Sign

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build and sign
        env:
          CSC_LINK: ${{ secrets.WINDOWS_CERTIFICATE_BASE64 }}
          CSC_KEY_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
        run: |
          # Decode certificate from base64
          $cert = [System.Convert]::FromBase64String($env:CSC_LINK)
          [IO.File]::WriteAllBytes("$env:TEMP\cert.pfx", $cert)
          $env:CSC_LINK = "$env:TEMP\cert.pfx"
          
          # Build and sign
          npm run package
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: installers
          path: release/*.exe
```

### Storing Certificate in GitHub Secrets

1. **Encode certificate to base64:**
   ```powershell
   $bytes = [IO.File]::ReadAllBytes("certificate.pfx")
   $base64 = [Convert]::ToBase64String($bytes)
   $base64 | Out-File certificate.txt
   ```

2. **Add to GitHub Secrets:**
   - Go to repository Settings → Secrets → Actions
   - Add `WINDOWS_CERTIFICATE_BASE64`: (paste base64 content)
   - Add `CERTIFICATE_PASSWORD`: (certificate password)

## Troubleshooting

### "Certificate not found" Error
- Verify `CSC_LINK` path is correct
- Check file permissions
- Ensure certificate file exists

### "Invalid password" Error
- Verify `CSC_KEY_PASSWORD` is correct
- Check for special characters in password
- Try enclosing password in quotes

### "Timestamp server unavailable" Error
- Check internet connection
- Try again (servers may be temporarily down)
- Script automatically tries multiple servers

### SmartScreen Warnings Persist
- **Standard Certificate**: Build reputation over time
  - More downloads = better reputation
  - Can take weeks or months
- **EV Certificate**: No warnings from day one
- **Self-Signed**: Always shows warnings

### Signature Verification Fails
- Check certificate hasn't expired
- Verify timestamp was applied
- Ensure certificate chain is complete
- Check certificate is trusted by Windows

## Best Practices

1. **Secure Storage**
   - Never commit certificates to version control
   - Use encrypted storage for certificates
   - Limit access to certificate files
   - Use hardware tokens for EV certificates

2. **Password Management**
   - Use strong, unique passwords
   - Store passwords in secure password manager
   - Use environment variables, not hardcoded values
   - Rotate passwords periodically

3. **Certificate Management**
   - Monitor expiration dates
   - Renew certificates before expiration
   - Keep backup copies securely
   - Document certificate details

4. **Build Process**
   - Always sign production builds
   - Verify signatures after signing
   - Test installers on clean Windows systems
   - Document signing process

5. **Reputation Building**
   - Release updates regularly
   - Maintain consistent publisher name
   - Avoid certificate changes
   - Monitor SmartScreen feedback

## Cost Considerations

### Initial Setup
- **EV Certificate**: $300-500/year
- **Standard Certificate**: $100-200/year
- **Self-Signed**: Free (development only)

### Ongoing Costs
- Annual certificate renewal
- Potential hardware token replacement (EV)
- Time for validation process

### ROI
- Reduced support costs (fewer "can't install" issues)
- Increased trust and downloads
- Better user experience
- Professional appearance

## Resources

- [Microsoft Code Signing Guide](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [electron-builder Code Signing](https://www.electron.build/code-signing)
- [DigiCert Code Signing](https://www.digicert.com/signing/code-signing-certificates)
- [Sectigo Code Signing](https://sectigo.com/ssl-certificates-tls/code-signing)
- [Windows SignTool Documentation](https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool)

## Quick Start Guide

### For Development (Self-Signed Certificate)

1. **Create a development certificate:**
   ```bash
   cd azstudio
   node scripts/sign.js --create-dev-cert
   ```

2. **Set environment variables:**
   ```cmd
   set CSC_LINK=build\dev-cert.pfx
   set CSC_KEY_PASSWORD=development
   ```

3. **Build with signing:**
   ```bash
   npm run package
   ```

⚠️ **Warning**: Self-signed certificates will show security warnings to users. Use only for development and testing.

### For Production (Commercial Certificate)

1. **Obtain a certificate** from a trusted CA (DigiCert, Sectigo, etc.)

2. **Store certificate securely:**
   ```bash
   # Create secure directory
   mkdir C:\Certificates
   copy your-cert.pfx C:\Certificates\azstudio.pfx
   
   # Set restrictive permissions
   icacls C:\Certificates\azstudio.pfx /inheritance:r /grant:r "%USERNAME%:R"
   ```

3. **Set environment variables permanently:**
   - Open System Properties → Advanced → Environment Variables
   - Add User Variables:
     - `CSC_LINK`: `C:\Certificates\azstudio.pfx`
     - `CSC_KEY_PASSWORD`: `your_certificate_password`

4. **Build with signing:**
   ```bash
   npm run package
   ```

5. **Verify signature:**
   ```bash
   node scripts/sign.js --verify
   ```

## Support

For code signing issues:
1. Check this documentation
2. Review electron-builder logs
3. Verify certificate with CA
4. Contact certificate provider support
5. Check Windows Event Viewer for signing errors
