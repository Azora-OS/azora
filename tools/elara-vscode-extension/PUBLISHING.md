# 🚀 Publishing Elara AI Family to VS Code Marketplace

## Prerequisites

### 1. Create Azure DevOps Account
1. Go to https://dev.azure.com
2. Sign in with Microsoft account
3. Create new organization (e.g., "azora-extensions")

### 2. Create Personal Access Token (PAT)
1. Go to https://dev.azure.com/[your-org]/_usersSettings/tokens
2. Click "New Token"
3. Name: "vscode-marketplace"
4. Organization: All accessible organizations
5. Scopes: **Marketplace** → **Manage**
6. Expiration: 1 year
7. Click "Create" and **SAVE THE TOKEN**

### 3. Create Publisher
```bash
# Install vsce globally
npm install -g @vscode/vsce

# Create publisher (one-time)
vsce create-publisher azora

# Login with PAT
vsce login azora
# Paste your PAT when prompted
```

## Build & Package

### Local Testing
```bash
cd /home/user/azora-os/tools/elara-vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package
# Creates: elara-ai-family-1.0.0.vsix

# Test locally
code --install-extension elara-ai-family-1.0.0.vsix
```

## Publish to Marketplace

### Option 1: Command Line (Recommended)
```bash
# Publish to marketplace
vsce publish

# Or publish specific version
vsce publish 1.0.0

# Or publish patch/minor/major
vsce publish patch
vsce publish minor
vsce publish major
```

### Option 2: Manual Upload
1. Go to https://marketplace.visualstudio.com/manage
2. Click "New extension" → "Visual Studio Code"
3. Upload `elara-ai-family-1.0.0.vsix`
4. Fill in details and publish

## Pre-Publication Checklist

- [x] README.md with screenshots and features
- [x] CHANGELOG.md with version history
- [x] LICENSE file
- [x] Icon (media/elara-icon.png)
- [x] Repository URL in package.json
- [x] Keywords for discoverability
- [x] Gallery banner color
- [ ] Screenshots/GIFs for README
- [ ] Test extension locally
- [ ] Verify all commands work
- [ ] Check API connectivity

## Post-Publication

### Update Extension
```bash
# Make changes
# Update version in package.json
# Update CHANGELOG.md

# Publish update
vsce publish
```

### Monitor
- Check marketplace page: https://marketplace.visualstudio.com/items?itemName=azora.elara-ai-family
- Monitor downloads and ratings
- Respond to reviews and issues

## Marketing

### Announcement Channels
- [ ] Azora website (azora.world)
- [ ] Discord community
- [ ] Twitter/X (@Azora_OS)
- [ ] GitHub README
- [ ] Dev.to article
- [ ] Reddit (r/vscode, r/programming)
- [ ] LinkedIn post

### Key Messages
- "Meet Elara and her AI family - 11 personalities to help you code"
- "Ubuntu philosophy meets AI coding assistance"
- "More than an assistant - it's a family"
- "Context-aware, relationship-driven AI"

## Troubleshooting

### "Publisher not found"
```bash
vsce create-publisher azora
vsce login azora
```

### "Extension validation failed"
- Check package.json for required fields
- Ensure icon exists at specified path
- Verify all files compile without errors

### "PAT expired"
```bash
# Create new PAT in Azure DevOps
vsce login azora
# Enter new PAT
```

## Quick Commands Reference

```bash
# Package
npm run package

# Publish
vsce publish

# Unpublish (careful!)
vsce unpublish azora.elara-ai-family

# Show extension info
vsce show azora.elara-ai-family

# List versions
vsce ls azora.elara-ai-family
```

## Version Strategy

- **1.0.x** - Bug fixes, minor improvements
- **1.x.0** - New features, enhancements
- **x.0.0** - Major changes, breaking updates

Current: **1.0.0** (Initial Release)

## Support

- Issues: https://github.com/Sizwe780/azora-os/issues
- Email: contact@azora.world
- Discord: https://discord.gg/azora

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

Ready to share Elara with the world! 🚀
