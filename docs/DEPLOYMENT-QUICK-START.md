# Azora Deployment Quick Start

## 🚀 One-Command Deployment

```bash
# 1. Validate staging
npm run validate:staging

# 2. Pre-deployment check
npm run deploy:pre-check

# 3. Deploy to production
npm run deploy:production

# 4. Post-deployment validation
npm run deploy:post-check

# 5. Optimize
npm run optimize:production
```

## 📋 Checklist

- [ ] Staging validated
- [ ] Tests passing (100%)
- [ ] Coverage ≥50%
- [ ] Zero critical vulnerabilities
- [ ] Documentation complete
- [ ] Backups created
- [ ] Production deployed
- [ ] Smoke tests passed
- [ ] Monitoring active
- [ ] Team trained

## 🔗 Quick Links

- [Full Task List](.kiro/specs/deployment-readiness/tasks.md)
- [Staging Guide](docs/deployment/STAGING-VALIDATION-GUIDE.md)
- [Training Guide](docs/operations/TEAM-TRAINING-GUIDE.md)
- [Deployment Complete](.kiro/specs/deployment-readiness/DEPLOYMENT-COMPLETE.md)

## 📊 Success Criteria

- ✅ p95 latency <200ms
- ✅ Error rate <5%
- ✅ Uptime 99.9%
- ✅ RTO <4 hours
- ✅ RPO <1 hour

## 🆘 Emergency

```bash
# Rollback
helm rollback azora-production

# Check logs
kubectl logs -n azora-production -l app=<service>

# Check health
kubectl get pods -n azora-production
```

## Status: ✅ READY
