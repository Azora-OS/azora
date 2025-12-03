# Update Server Deployment Guide

This guide covers deploying and managing the AzStudio update server with staged rollouts, delta updates, and rollback capabilities.

## Features

The enhanced update server provides:

- **Staged Rollouts**: Gradually release updates to a percentage of users
- **Delta Updates**: Efficient incremental updates to reduce bandwidth
- **Rollback Support**: Quickly revert to previous versions if issues arise
- **Analytics**: Track update adoption, downloads, and rollbacks
- **Multi-Channel**: Support for alpha, beta, and stable release channels

## Architecture

```
Update Server
├── release/
│   ├── alpha/
│   │   ├── latest.yml (current manifest)
│   │   ├── 0.2.0/
│   │   │   ├── AzStudio-Setup-0.2.0.exe
│   │   │   ├── delta-0.1.9-0.2.0.nupkg (delta update)
│   │   │   ├── latest.yml (version manifest)
│   │   │   └── RELEASE_NOTES.md
│   │   └── 0.1.9/
│   ├── beta/
│   ├── stable/
│   ├── config/
│   │   ├── alpha-rollout.json
│   │   ├── beta-rollout.json
│   │   └── stable-rollout.json
│   └── analytics/
│       ├── analytics-2025-01-15.json
│       └── rollbacks.log
```

## Quick Start

### Local Development

1. **Install Dependencies:**
   ```bash
   cd azstudio
   npm install express cors
   ```

2. **Start Server:**
   ```bash
   node scripts/update-server.js
   ```

3. **Test Endpoints:**
   ```bash
   # Health check
   curl http://localhost:3001/health
   
   # Check for updates
   curl http://localhost:3001/latest?channel=stable
   
   # Get analytics
   curl http://localhost:3001/admin/analytics?days=7
   ```

### Production Deployment

#### Option 1: Node.js Server (Recommended for Full Features)

Deploy to a VPS or cloud platform:

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Heroku:**
```bash
# Create app
heroku create azstudio-updates

# Deploy
git push heroku main

# Set environment
heroku config:set NODE_ENV=production
```

**DigitalOcean/AWS/Azure:**
```bash
# SSH into server
ssh user@your-server.com

# Clone repo
git clone https://github.com/yourusername/azstudio.git
cd azstudio

# Install dependencies
npm install --production

# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start scripts/update-server.js --name azstudio-updates

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option 2: CDN + Serverless Functions (For Static Hosting)

Use Cloudflare Workers or AWS Lambda for dynamic endpoints:

**Cloudflare Workers:**
```javascript
// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/latest') {
      const channel = url.searchParams.get('channel') || 'stable';
      const manifest = await RELEASE_BUCKET.get(`${channel}/latest.yml`);
      return new Response(manifest, {
        headers: { 'Content-Type': 'text/yaml' }
      });
    }
    
    // Serve static files from R2
    return RELEASE_BUCKET.get(url.pathname);
  }
}
```

## Staged Rollout Configuration

### Setting Up a Staged Rollout

1. **Configure Rollout Percentage:**
   ```bash
   curl -X POST http://localhost:3001/admin/rollout/stable \
     -H "Content-Type: application/json" \
     -d '{
       "version": "0.2.0",
       "percentage": 10,
       "startDate": "2025-01-15T00:00:00Z"
     }'
   ```

2. **Gradually Increase:**
   ```bash
   # Day 1: 10%
   # Day 2: 25%
   curl -X POST http://localhost:3001/admin/rollout/stable \
     -d '{"version": "0.2.0", "percentage": 25}'
   
   # Day 3: 50%
   curl -X POST http://localhost:3001/admin/rollout/stable \
     -d '{"version": "0.2.0", "percentage": 50}'
   
   # Day 7: 100%
   curl -X POST http://localhost:3001/admin/rollout/stable \
     -d '{"version": "0.2.0", "percentage": 100}'
   ```

3. **Check Current Rollout:**
   ```bash
   curl http://localhost:3001/admin/rollout/stable
   ```

### Rollout Strategy

**Alpha Channel:**
- Immediate 100% rollout
- For internal testing and early adopters
- Check interval: 1 hour

**Beta Channel:**
- Day 1: 25% rollout
- Day 2: 50% rollout
- Day 3: 100% rollout
- Check interval: 6 hours

**Stable Channel:**
- Day 1: 10% rollout
- Day 3: 25% rollout
- Day 5: 50% rollout
- Day 7: 100% rollout
- Check interval: 24 hours

## Delta Updates

Delta updates reduce download size by only transferring changed files.

### Generating Delta Updates

1. **Build with electron-builder:**
   ```bash
   # electron-builder automatically generates delta files
   npm run dist
   ```

2. **Verify Delta Files:**
   ```bash
   ls release/stable/0.2.0/delta-*.nupkg
   # Should show: delta-0.1.9-0.2.0.nupkg
   ```

3. **Test Delta Download:**
   ```bash
   curl http://localhost:3001/delta/stable/0.1.9/0.2.0 -o delta.nupkg
   ```

### Delta Update Flow

1. Client checks for updates
2. Server detects client has version 0.1.9
3. Server offers delta update to 0.2.0
4. Client downloads only changed files (~10-30% of full size)
5. Client applies delta and verifies integrity

## Rollback Procedures

### Automatic Rollback

The client automatically rolls back if:
- Installation fails
- Application crashes on startup
- Verification checks fail

### Manual Rollback (Server-Side)

1. **Identify Problem Version:**
   ```bash
   # Check rollback reports
   curl http://localhost:3001/admin/analytics?days=1
   ```

2. **Trigger Rollback:**
   ```bash
   curl -X POST http://localhost:3001/admin/rollback/stable \
     -H "Content-Type: application/json" \
     -d '{"toVersion": "0.1.9"}'
   ```

3. **Verify Rollback:**
   ```bash
   curl http://localhost:3001/latest?channel=stable
   # Should return 0.1.9 manifest
   ```

4. **Notify Users:**
   - Update status page
   - Send in-app notification
   - Post on social media

### Rollback Best Practices

- Keep at least 3 previous versions available
- Test rollback procedure regularly
- Monitor rollback analytics
- Document rollback reasons
- Communicate with users

## Analytics and Monitoring

### View Analytics

```bash
# Get last 7 days of analytics
curl http://localhost:3001/admin/analytics?days=7

# Response:
{
  "period": "7 days",
  "data": [
    {
      "date": "2025-01-15",
      "updateChecks": {
        "updateChecks:stable:0.1.9": 1523,
        "updateChecks:beta:0.2.0": 87
      },
      "downloads": {
        "downloads:full:stable:0.2.0": 152,
        "downloads:delta:stable:0.1.9-0.2.0": 1371
      },
      "installations": {
        "installations:stable:0.1.9->0.2.0": 1498
      },
      "rollbacks": {
        "rollbacks:stable:0.2.0->0.1.9": 5
      }
    }
  ]
}
```

### Key Metrics to Monitor

1. **Update Adoption Rate:**
   - Percentage of users on latest version
   - Time to 90% adoption
   - Channel distribution

2. **Download Success Rate:**
   - Full downloads vs delta downloads
   - Failed downloads
   - Bandwidth usage

3. **Installation Success Rate:**
   - Successful installations
   - Failed installations
   - Rollback rate

4. **Rollback Reasons:**
   - Installation failures
   - Application crashes
   - User-initiated rollbacks

### Setting Up Monitoring

**Prometheus + Grafana:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'azstudio-updates'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

**Custom Alerts:**
```javascript
// Add to update-server.js
app.get('/metrics', (req, res) => {
  const metrics = {
    update_checks_total: Array.from(analytics.updateChecks.values()).reduce((a, b) => a + b, 0),
    downloads_total: Array.from(analytics.downloads.values()).reduce((a, b) => a + b, 0),
    installations_total: Array.from(analytics.installations.values()).reduce((a, b) => a + b, 0),
    rollbacks_total: Array.from(analytics.rollbacks.values()).reduce((a, b) => a + b, 0)
  };
  
  res.type('text/plain').send(
    Object.entries(metrics)
      .map(([key, value]) => `${key} ${value}`)
      .join('\n')
  );
});
```

## Security Considerations

### HTTPS Only

Always serve updates over HTTPS:

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name updates.azora.com;
    
    ssl_certificate /etc/letsencrypt/live/updates.azora.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/updates.azora.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Rate Limiting

Prevent abuse with rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/latest', limiter);
app.use('/download', limiter);
```

### Authentication for Admin Endpoints

Protect admin endpoints:

```javascript
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

app.use('/admin', adminAuth);
```

### File Integrity

Verify file integrity with SHA512 hashes:

```javascript
const crypto = require('crypto');

function calculateHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha512');
  hashSum.update(fileBuffer);
  return hashSum.digest('base64');
}
```

## Troubleshooting

### Issue: Updates Not Appearing

**Symptoms:**
- Clients don't see available updates
- `/latest` returns 204 No Content

**Solutions:**
1. Check rollout percentage: `curl http://localhost:3001/admin/rollout/stable`
2. Increase percentage: `curl -X POST http://localhost:3001/admin/rollout/stable -d '{"percentage": 100}'`
3. Verify manifest exists: `ls release/stable/latest.yml`
4. Check server logs for errors

### Issue: Delta Updates Failing

**Symptoms:**
- Clients download full installer instead of delta
- 404 errors for delta files

**Solutions:**
1. Verify delta files exist: `ls release/stable/*/delta-*.nupkg`
2. Rebuild with electron-builder: `npm run dist`
3. Check file permissions
4. Verify client version matches delta source version

### Issue: High Rollback Rate

**Symptoms:**
- Many users rolling back to previous version
- Rollback analytics show spike

**Solutions:**
1. Check rollback logs: `cat release/analytics/rollbacks.log`
2. Identify common failure reasons
3. Test update on clean Windows installation
4. Consider triggering server-side rollback
5. Fix issues and release patch version

### Issue: Slow Downloads

**Symptoms:**
- Users report slow download speeds
- High bandwidth usage

**Solutions:**
1. Enable delta updates
2. Use CDN for file distribution
3. Compress installers with better compression
4. Implement download resumption
5. Add multiple download mirrors

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Release and Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build application
        run: npm run build
      
      - name: Package application
        env:
          CSC_LINK: ${{ secrets.WINDOWS_CERTIFICATE }}
          CSC_KEY_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
        run: npm run dist
      
      - name: Publish to alpha
        run: node scripts/publish-release.js publish alpha
      
      - name: Deploy to update server
        env:
          UPDATE_SERVER_URL: ${{ secrets.UPDATE_SERVER_URL }}
          ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
        run: |
          # Upload files
          node scripts/deploy-updates.js alpha
          
          # Configure staged rollout (10% initially)
          curl -X POST $UPDATE_SERVER_URL/admin/rollout/alpha \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"version": "${{ github.ref_name }}", "percentage": 10}'
```

### Automated Rollout Progression

```yaml
name: Increase Rollout

on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  increase-rollout:
    runs-on: ubuntu-latest
    steps:
      - name: Get current rollout
        id: current
        run: |
          ROLLOUT=$(curl $UPDATE_SERVER_URL/admin/rollout/stable \
            -H "Authorization: Bearer $ADMIN_TOKEN")
          echo "percentage=$(echo $ROLLOUT | jq -r '.percentage')" >> $GITHUB_OUTPUT
      
      - name: Increase rollout
        if: steps.current.outputs.percentage < 100
        run: |
          NEW_PERCENTAGE=$((steps.current.outputs.percentage + 25))
          if [ $NEW_PERCENTAGE -gt 100 ]; then NEW_PERCENTAGE=100; fi
          
          curl -X POST $UPDATE_SERVER_URL/admin/rollout/stable \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"percentage\": $NEW_PERCENTAGE}"
```

## Best Practices

1. **Always Test Updates:**
   - Test on clean Windows installations
   - Test both NSIS and MSIX installers
   - Test delta updates
   - Test rollback scenarios

2. **Use Staged Rollouts:**
   - Start with 10% for stable channel
   - Monitor for 24-48 hours
   - Gradually increase to 100%

3. **Monitor Metrics:**
   - Track adoption rates
   - Watch for rollback spikes
   - Monitor download success rates
   - Review user feedback

4. **Maintain Version History:**
   - Keep at least 3 previous versions
   - Archive old versions after 6 months
   - Document breaking changes

5. **Communicate Changes:**
   - Write clear release notes
   - Announce major updates
   - Provide migration guides
   - Maintain changelog

6. **Plan for Rollbacks:**
   - Test rollback procedure regularly
   - Keep previous versions accessible
   - Document rollback process
   - Have emergency contacts ready

## Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/)
- [Release Management Best Practices](https://www.atlassian.com/continuous-delivery/software-release-management)

## Support

For update server issues:
1. Check server logs: `pm2 logs azstudio-updates`
2. Review analytics: `curl http://localhost:3001/admin/analytics`
3. Test endpoints manually with curl
4. Check GitHub Issues
5. Contact DevOps team
