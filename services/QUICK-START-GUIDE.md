# 🚀 Azora OS Services - Quick Start Guide

**Get started implementing services in 5 minutes**

---

## 📋 Prerequisites

```bash
# Check Node.js version (requires 18+)
node --version

# Check npm
npm --version

# Check Docker (optional)
docker --version
```

---

## ⚡ Quick Implementation

### Option 1: Batch Generate Education Services (Recommended)

```bash
cd /home/user/azora-os/services

# Make script executable
chmod +x batch-implement-education.sh

# Generate all 15 education services
./batch-implement-education.sh

# Install dependencies for all services
for dir in azora-education azora-lms azora-sapiens azora-assessment azora-classroom azora-content azora-library azora-credentials azora-collaboration azora-academic-integrity azora-studyspaces azora-student-life azora-research-center azora-innovation-hub azora-corporate-learning; do
  cd $dir && npm install && cd ..
done

# Start all education services
docker-compose -f docker-compose.education.yml up -d
```

### Option 2: Manual Single Service

```bash
cd /home/user/azora-os/services

# Create service directory
mkdir azora-education
cd azora-education

# Copy template files from any existing service
cp ../auth-service/package.json .
cp ../auth-service/index.js .

# Edit package.json and index.js
# Update service name and port

# Install and start
npm install
npm start
```

---

## 🧪 Testing Services

### Health Check All Services

```bash
cd /home/user/azora-os/services

# Check education services
for port in {3100..3114}; do
  echo "Checking port $port..."
  curl -s http://localhost:$port/health || echo "Service not running"
done
```

### Individual Service Test

```bash
# Test specific service
curl http://localhost:3100/health

# Expected response:
# {"status":"healthy","service":"azora-education","timestamp":"2025-01-10T..."}
```

---

## 📊 Implementation Priority

### Week 1-2: Education Services (15 services)
```bash
./batch-implement-education.sh
docker-compose -f docker-compose.education.yml up -d
```

### Week 3: Marketplace Services (8 services)
```bash
./batch-implement-marketplace.sh  # Create this next
docker-compose -f docker-compose.marketplace.yml up -d
```

### Week 4: Infrastructure Services (14 services)
```bash
./batch-implement-infrastructure.sh  # Create this next
docker-compose -f docker-compose.infrastructure.yml up -d
```

---

## 🐳 Docker Commands

```bash
# Start all education services
docker-compose -f docker-compose.education.yml up -d

# View logs
docker-compose -f docker-compose.education.yml logs -f

# Stop services
docker-compose -f docker-compose.education.yml down

# Rebuild after changes
docker-compose -f docker-compose.education.yml up -d --build
```

---

## 📝 Next Steps

1. **Review the plan**: Read [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)
2. **Generate services**: Run `./batch-implement-education.sh`
3. **Test services**: Check health endpoints
4. **Implement logic**: Add business logic to each service
5. **Deploy**: Use Docker Compose for deployment

---

## 🌟 Ubuntu Philosophy

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

Start with education services - they're the foundation of Azora OS! 🚀
