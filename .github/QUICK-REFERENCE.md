# GitHub Workflows Quick Reference

## 🚀 Quick Commands

```bash
# Validate workflows
node scripts/validate-workflows.js

# Test before push
npm run lint && npm run typecheck && npm run test

# Manual workflow trigger
gh workflow run test.yml
```

## 📋 Workflow Triggers

| Workflow | Auto | Manual | Schedule |
|----------|------|--------|----------|
| test.yml | Push, PR | ✅ | - |
| e2e.yml | Push, PR | ✅ | Daily 2 AM |
| lint.yml | Push, PR | ✅ | - |
| typecheck.yml | Push, PR | ✅ | - |
| security.yml | Push, PR | ✅ | Weekly Mon |
| deploy-staging.yml | Push develop | ✅ | - |
| deploy-production.yml | Push main, Tags | ✅ | - |
| release.yml | Tags v*.*.* | ✅ | - |
| dependency-update.yml | - | ✅ | Weekly Mon |

## 🔐 Required Secrets

**Essential (3):**
- DOCKER_USERNAME
- DOCKER_PASSWORD
- SLACK_WEBHOOK

**Deployment (6):**
- STAGING_HOST, STAGING_USER, STAGING_KEY
- PROD_HOST, PROD_USER, PROD_KEY

**Optional (3):**
- PROD_DATABASE_URL
- NPM_TOKEN
- RENOVATE_TOKEN

## 🎯 Success Checklist

- [ ] All 9 workflows created
- [ ] Secrets configured
- [ ] Environments set up
- [ ] Test PR passes
- [ ] Notifications working

## 📞 Support

Issues? Check `.github/WORKFLOW-SETUP.md`
