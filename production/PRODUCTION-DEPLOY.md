# 🚀 Production Deployment Guide

## Quick Deploy (5 minutes)

```bash
# 1. Setup production environment
npm run prod:setup

# 2. Build and deploy
npm run deploy:build
npm run deploy:prod

# 3. Verify deployment
npm run health:check
```

## Production URLs
- **API Gateway**: https://azora.world/api
- **Health Check**: https://azora.world/health
- **Admin Panel**: https://admin.azora.world

## Environment Variables
Copy `.env.production` to `.env` and update:
- `JWT_SECRET` - Strong production secret
- `DATABASE_URL` - PostgreSQL connection
- `CORS_ORIGIN` - Your domain(s)

## SSL Certificate
Place SSL certificates in `./ssl/`:
- `azora.world.crt`
- `azora.world.key`

## Monitoring
```bash
# View logs
npm run deploy:logs

# Check service health
docker-compose -f docker-compose.prod.yml ps

# Stop services
npm run deploy:stop
```

## Production Checklist
- [ ] SSL certificates installed
- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] Health checks passing
- [ ] Rate limiting configured
- [ ] Security headers enabled