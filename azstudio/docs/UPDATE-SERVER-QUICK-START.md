# Update Server Quick Start Guide

Get the AzStudio update server running in 5 minutes.

## Prerequisites

- Node.js 20+
- Built AzStudio application
- Basic understanding of release channels

## Step 1: Install Dependencies

```bash
cd azstudio
npm install express cors
```

## Step 2: Build and Package

```bash
# Build the application
npm run build

# Package for Windows (creates NSIS + MSIX installers)
npm run package:all
```

This creates installers in `release/` directory.

## Step 3: Publish to a Channel

```bash
# Publish to alpha channel (for testing)
node scripts/publish-release.js publish alpha

# Or publish to stable channel
node scripts/publish-release.js publish stable
```

This organizes files and creates the update manifest.

## Step 4: Start the Update Server

```bash
npm run update-server
```

Server starts on `http://localhost:3001`

## Step 5: Test the Update

```bash
# Check if updates are available
curl http://localhost:3001/latest?channel=stable

# Should return the latest.yml manifest
```

## Step 6: Configure Staged Rollout (Optional)

```bash
# Start with 10% rollout
curl -X POST http://localhost:3001/admin/rollout/stable \
  -H "Content-Type: application/json" \
  -d '{"version": "0.1.0", "percentage": 10}'

# Increase to 50%
curl -X POST http://localhost:3001/admin/rollout/stable \
  -H "Content-Type: application/json" \
  -d '{"percentage": 50}'

# Full rollout (100%)
curl -X POST http://localhost:3001/admin/rollout/stable \
  -H "Content-Type: application/json" \
  -d '{"percentage": 100}'
```

## Step 7: Monitor Analytics

```bash
# View analytics for last 7 days
npm run analytics 7
```

## Common Tasks

### Deploy a New Version

```bash
# 1. Update version in package.json
npm version 0.2.0

# 2. Build and package
npm run build
npm run package:all

# 3. Publish to channel
node scripts/publish-release.js publish stable

# 4. Configure rollout (optional)
curl -X POST http://localhost:3001/admin/rollout/stable \
  -d '{"version": "0.2.0", "percentage": 10}'
```

### Rollback to Previous Version

```bash
# Rollback stable channel to 0.1.0
npm run rollback stable 0.1.0

# Or use curl
curl -X POST http://localhost:3001/admin/rollback/stable \
  -H "Content-Type: application/json" \
  -d '{"toVersion": "0.1.0"}'
```

### Check Rollout Status

```bash
curl http://localhost:3001/admin/rollout/stable
```

### View Available Versions

```bash
curl http://localhost:3001/versions?channel=stable
```

## Release Channels

### Alpha
- **Purpose**: Bleeding edge, internal testing
- **Default Rollout**: 100%
- **Update Check**: Every 1 hour
- **Use For**: Development, early testing

### Beta
- **Purpose**: Pre-release testing
- **Default Rollout**: 25%
- **Update Check**: Every 6 hours
- **Use For**: Beta testers, adventurous users

### Stable
- **Purpose**: Production releases
- **Default Rollout**: 10%
- **Update Check**: Every 24 hours
- **Use For**: All users

## Staged Rollout Strategy

Recommended rollout schedule for stable channel:

```bash
# Day 1: 10% rollout
curl -X POST http://localhost:3001/admin/rollout/stable \
  -d '{"percentage": 10}'

# Day 3: 25% rollout
curl -X POST http://localhost:3001/admin/rollout/stable \
  -d '{"percentage": 25}'

# Day 5: 50% rollout
curl -X POST http://localhost:3001/admin/rollout/stable \
  -d '{"percentage": 50}'

# Day 7: 100% rollout
curl -X POST http://localhost:3001/admin/rollout/stable \
  -d '{"percentage": 100}'
```

## Production Deployment

### Option 1: Railway (Easiest)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 2: Heroku

```bash
# Create app
heroku create azstudio-updates

# Deploy
git push heroku main
```

### Option 3: VPS (Most Control)

```bash
# SSH into server
ssh user@your-server.com

# Clone and setup
git clone https://github.com/yourusername/azstudio.git
cd azstudio
npm install --production

# Start with PM2
npm install -g pm2
pm2 start scripts/update-server.js --name azstudio-updates
pm2 save
pm2 startup
```

### Option 4: AWS S3 + CloudFront (Best Performance)

1. Create `deploy-config.json`:
   ```json
   {
     "target": "s3",
     "s3": {
       "bucket": "azstudio-updates",
       "region": "us-east-1",
       "cloudfront": "YOUR_DISTRIBUTION_ID"
     }
   }
   ```

2. Deploy:
   ```bash
   node scripts/deploy-updates.js deploy stable 0.1.0
   ```

## Troubleshooting

### Updates Not Showing

**Problem**: Clients don't see updates

**Solution**:
```bash
# Check rollout percentage
curl http://localhost:3001/admin/rollout/stable

# Increase to 100%
curl -X POST http://localhost:3001/admin/rollout/stable \
  -d '{"percentage": 100}'
```

### Server Not Starting

**Problem**: Port already in use

**Solution**:
```bash
# Use different port
PORT=3002 npm run update-server
```

### Files Not Found

**Problem**: 404 errors for downloads

**Solution**:
```bash
# Verify files exist
ls release/stable/0.1.0/

# Re-publish if needed
node scripts/publish-release.js publish stable
```

## Next Steps

1. **Read Full Documentation**: [UPDATE-SERVER-DEPLOYMENT.md](./UPDATE-SERVER-DEPLOYMENT.md)
2. **Configure CI/CD**: Automate releases with GitHub Actions
3. **Set Up Monitoring**: Track adoption and rollback rates
4. **Enable HTTPS**: Use Let's Encrypt for production
5. **Configure CDN**: Use CloudFront or Cloudflare for better performance

## Support

- **Documentation**: See `docs/UPDATE-SERVER-DEPLOYMENT.md`
- **Issues**: Check GitHub Issues
- **Questions**: Contact DevOps team

## Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
