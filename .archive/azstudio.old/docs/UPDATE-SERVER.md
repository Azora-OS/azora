# Update Server Setup Guide

This guide explains how to set up and manage the AzStudio update server for automatic updates.

> **Quick Start**: For a faster setup, see [UPDATE-SERVER-QUICK-START.md](./UPDATE-SERVER-QUICK-START.md)
> 
> **Full Deployment Guide**: For production deployment with staged rollouts and delta updates, see [UPDATE-SERVER-DEPLOYMENT.md](./UPDATE-SERVER-DEPLOYMENT.md)

## Overview

AzStudio uses `electron-updater` for automatic updates. The update system supports:
- Multiple release channels (alpha, beta, stable)
- Staged rollouts
- Delta updates for efficiency
- Automatic rollback on failure
- Background downloads with user notifications

## Architecture

```
Update Server
├── alpha/
│   ├── latest.yml          # Update manifest
│   ├── 0.2.0/
│   │   ├── AzStudio-Setup-0.2.0.exe
│   │   ├── AzStudio-0.2.0-x64.appx
│   │   └── RELEASE_NOTES.md
│   └── 0.1.0/
├── beta/
│   ├── latest.yml
│   └── 0.1.5/
└── stable/
    ├── latest.yml
    └── 0.1.0/
```

## Quick Start

### Option 1: Simple Static File Server (Development)

Use the included update server for local testing:

```bash
cd azstudio
npm install express cors js-yaml
node scripts/update-server.js
```

The server will run on `http://localhost:3001` and serve files from the `release/` directory.

### Option 2: CDN/Cloud Storage (Production)

For production, use a CDN or cloud storage service:

**AWS S3 + CloudFront:**
```bash
# Upload release files
aws s3 sync release/ s3://azstudio-updates/ --acl public-read

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Azure Blob Storage:**
```bash
# Upload release files
az storage blob upload-batch -d azstudio-updates -s release/ --account-name youraccount
```

**Vercel/Netlify:**
- Deploy the `release/` directory as a static site
- Configure custom domain: `updates.azora.com`

## Publishing Releases

### Step 1: Build the Application

```bash
cd azstudio
npm run build
npm run package:all
```

This creates installers in the `release/` directory.

### Step 2: Organize Release Files

Use the publish script to organize files by channel:

```bash
# Publish to alpha channel
node scripts/publish-release.js publish alpha

# Publish to beta channel
node scripts/publish-release.js publish beta

# Publish to stable channel
node scripts/publish-release.js publish stable
```

This script:
1. Copies installers to the channel directory
2. Calculates SHA512 hashes
3. Generates `latest.yml` manifest
4. Creates release notes template

### Step 3: Edit Release Notes

Edit the generated `RELEASE_NOTES.md` file:

```bash
# Example: release/stable/0.1.0/RELEASE_NOTES.md
```

### Step 4: Upload to Server

**For Static Server:**
```bash
# Files are already in place
# Just restart the server if needed
```

**For CDN:**
```bash
# Upload the channel directory
aws s3 sync release/stable/ s3://azstudio-updates/stable/ --acl public-read
```

### Step 5: Test the Update

```bash
# Test update check
curl https://updates.azora.com/azstudio/stable/latest.yml

# Or use the test script
npm run test:update
```

## Update Manifest Format

The `latest.yml` file contains update metadata:

```yaml
version: 0.1.0
releaseDate: 2025-01-15T10:30:00.000Z
files:
  - url: https://updates.azora.com/azstudio/stable/0.1.0/AzStudio-Setup-0.1.0.exe
    sha512: base64_encoded_hash
    size: 123456789
  - url: https://updates.azora.com/azstudio/stable/0.1.0/AzStudio-0.1.0-x64.appx
    sha512: base64_encoded_hash
    size: 123456789
```

## Release Channels

### Alpha Channel
- **Purpose**: Bleeding edge features, frequent updates
- **Audience**: Internal developers, early testers
- **Update Frequency**: Multiple times per day
- **Check Interval**: 1 hour
- **URL**: `https://updates.azora.com/azstudio/alpha`

### Beta Channel
- **Purpose**: Pre-release testing, stabilization
- **Audience**: Beta testers, adventurous users
- **Update Frequency**: Weekly
- **Check Interval**: 6 hours
- **URL**: `https://updates.azora.com/azstudio/beta`

### Stable Channel
- **Purpose**: Production releases
- **Audience**: All users
- **Update Frequency**: Monthly or as needed
- **Check Interval**: 24 hours
- **URL**: `https://updates.azora.com/azstudio/stable`

## Promoting Releases

Promote a release from one channel to another:

```bash
# Promote beta to stable
node scripts/publish-release.js promote beta stable 0.1.0

# Promote alpha to beta
node scripts/publish-release.js promote alpha beta 0.2.0
```

## Staged Rollouts

Implement staged rollouts by gradually updating the manifest:

1. **Day 1**: Release to alpha channel
2. **Day 3**: Promote to beta channel (10% of users)
3. **Day 7**: Promote to stable channel (100% of users)

## Rollback Strategy

If an update causes issues:

1. **Immediate Rollback:**
   ```bash
   # Restore previous version manifest
   cp release/stable/0.0.9/latest.yml release/stable/latest.yml
   ```

2. **Upload to Server:**
   ```bash
   aws s3 cp release/stable/latest.yml s3://azstudio-updates/stable/latest.yml
   ```

3. **Notify Users:**
   - Update release notes
   - Send notification through app
   - Post on status page

## Delta Updates

electron-updater supports delta updates for efficiency:

1. **Enable in Configuration:**
   ```json
   {
     "publish": {
       "provider": "generic",
       "url": "https://updates.azora.com/azstudio",
       "channel": "stable"
     },
     "generateUpdatesFilesForAllChannels": true
   }
   ```

2. **Build with Delta:**
   ```bash
   npm run dist
   ```

3. **Upload Delta Files:**
   - electron-updater generates `.nupkg` files
   - Upload these alongside full installers

## Monitoring Updates

### Server-Side Monitoring

Track update metrics:
- Download counts per version
- Update success/failure rates
- Geographic distribution
- Channel adoption rates

### Client-Side Telemetry

The AutoUpdateService logs events:
- Update checks
- Download progress
- Installation success/failure
- Rollback events

## Security Considerations

### Code Signing
- Always sign installers before publishing
- Verify signatures after upload
- Use EV certificates for production

### HTTPS Only
- Serve updates over HTTPS
- Use valid SSL certificates
- Enable HSTS headers

### Integrity Checks
- SHA512 hashes in manifest
- electron-updater verifies downloads
- Reject tampered files

### Access Control
- Restrict upload permissions
- Use IAM roles for cloud storage
- Enable audit logging

## Troubleshooting

### Update Check Fails

**Symptom**: App doesn't find updates

**Solutions**:
1. Check update server URL in config
2. Verify `latest.yml` is accessible
3. Check network connectivity
4. Review electron-updater logs

### Download Fails

**Symptom**: Update download fails or hangs

**Solutions**:
1. Check file permissions on server
2. Verify file URLs in manifest
3. Check firewall settings
4. Try manual download to test

### Installation Fails

**Symptom**: Update downloads but won't install

**Solutions**:
1. Check code signing certificate
2. Verify installer integrity
3. Check Windows SmartScreen settings
4. Review Windows Event Viewer logs

### Wrong Version Installed

**Symptom**: Old version after update

**Solutions**:
1. Clear app cache
2. Verify manifest version
3. Check for multiple installations
4. Manually uninstall and reinstall

## Testing Updates

### Local Testing

1. **Start Local Update Server:**
   ```bash
   node scripts/update-server.js
   ```

2. **Configure App for Local Server:**
   ```typescript
   // In development, point to local server
   autoUpdater.setFeedURL({
     provider: 'generic',
     url: 'http://localhost:3001',
     channel: 'stable'
   });
   ```

3. **Test Update Flow:**
   - Build version 0.1.0
   - Install and run
   - Build version 0.1.1
   - Publish to local server
   - Check for updates in app

### Production Testing

1. **Use Beta Channel:**
   - Publish to beta first
   - Test with beta users
   - Monitor for issues

2. **Staged Rollout:**
   - Release to 10% of users
   - Monitor metrics
   - Gradually increase to 100%

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build and package
        env:
          CSC_LINK: ${{ secrets.WINDOWS_CERTIFICATE }}
          CSC_KEY_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
        run: npm run package:all
      
      - name: Publish to alpha
        run: node scripts/publish-release.js publish alpha
      
      - name: Upload to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync release/alpha/ s3://azstudio-updates/alpha/ --acl public-read
```

## Best Practices

1. **Version Numbering**
   - Use semantic versioning (MAJOR.MINOR.PATCH)
   - Increment appropriately
   - Tag releases in Git

2. **Release Notes**
   - Write clear, user-friendly notes
   - Highlight breaking changes
   - Include screenshots for UI changes

3. **Testing**
   - Test updates on clean Windows installations
   - Verify both NSIS and MSIX installers
   - Test rollback scenarios

4. **Communication**
   - Announce major updates
   - Provide migration guides
   - Maintain changelog

5. **Monitoring**
   - Track update adoption rates
   - Monitor error rates
   - Collect user feedback

## Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/)

## Support

For update server issues:
1. Check server logs
2. Verify manifest format
3. Test with curl/wget
4. Review electron-updater logs
5. Contact DevOps team