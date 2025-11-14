# Azora OS - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
postgresql >= 15.0
```

### 1. Clone & Install
```bash
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os
```

### 2. Start Services
```bash
# Option A: All at once (requires tmux)
./start-core-services.sh

# Option B: One by one
cd services/azora-nexus && npm install && npm start &
cd services/api-gateway && npm install && npm start &
cd services/azora-education && npm install && npm start &
cd services/azora-mint && npm install && npm start &
cd services/azora-forge && npm install && npm start &
```

### 3. Test It Works
```bash
./test-integration.sh
```

---

## 📡 Service Endpoints

| Service | Port | Health Check | Purpose |
|---------|------|--------------|---------|
| **API Gateway** | 4000 | `/api/health` | Main entry point |
| **Nexus** | 3000 | `/health` | Event bus |
| **Education** | 3074 | `/health` | Courses & learning |
| **Mint** | 3080 | `/health` | Wallets & tokens |
| **Forge** | 3200 | `/health` | Jobs & skills |
| **AI Family** | 4010 | `/health` | AI chat |

---

## 🧪 Quick Tests

### Health Check
```bash
curl http://localhost:4000/api/health | jq
```

### Get Courses
```bash
curl http://localhost:4000/api/education/courses | jq
```

### Get Jobs
```bash
curl http://localhost:4000/api/forge/jobs | jq
```

### Chat with AI
```bash
curl -X POST http://localhost:4000/api/ai-family/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "member": "elara"}' | jq
```

### Check Events
```bash
curl http://localhost:3000/api/events | jq
```

---

## 🔄 Common Workflows

### Student Enrollment
```bash
curl -X POST http://localhost:4000/api/students/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-123",
    "courseId": "course-456",
    "userId": "user-789"
  }' | jq
```

**What happens:**
1. Student enrolled in education service
2. Wallet created in mint service
3. Event published to nexus
4. Other services notified

### Course Completion
```bash
curl -X POST http://localhost:4000/api/courses/complete \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-123",
    "courseId": "course-456",
    "score": 95
  }' | jq
```

**What happens:**
1. Progress updated in education
2. Mining reward issued in mint
3. Event published to nexus
4. Job matching triggered in forge

---

## 🛠️ Development

### Add New Endpoint
```javascript
// In your service (e.g., services/azora-education/index.js)
app.post('/api/your-endpoint', async (req, res) => {
  try {
    // Your logic here
    
    // Publish event
    await axios.post('http://localhost:3000/api/events', {
      type: 'your.event',
      data: { /* your data */ }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Subscribe to Events
```javascript
// In services/azora-nexus/service-connector.js
eventBus.subscribe('your.event', async (event) => {
  console.log('Event received:', event);
  // Handle event
});
```

### Add to API Gateway
```javascript
// In services/api-gateway/index.js
app.use('/api/your-service', createProxyMiddleware({ 
  target: 'http://localhost:YOUR_PORT',
  changeOrigin: true,
  pathRewrite: { '^/api/your-service': '/api' }
}));
```

---

## 📊 Monitoring

### Service Status
```bash
curl http://localhost:3000/api/services | jq
```

### Service Health
```bash
curl http://localhost:3000/api/services/health | jq
```

### Event History
```bash
curl http://localhost:3000/api/events?limit=10 | jq
```

### Event Types
```bash
curl http://localhost:3000/api/events/types | jq
```

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check if port is in use
lsof -i :4000

# Kill process
kill -9 <PID>

# Check logs
cd services/your-service
npm start
```

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -c "SELECT 1"

# Update .env file
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

### Services Can't Communicate
```bash
# Check all services are running
curl http://localhost:3000/health
curl http://localhost:4000/api/health
curl http://localhost:3074/health
curl http://localhost:3080/health
curl http://localhost:3200/health

# Check service registration
curl http://localhost:3000/api/services
```

---

## 📚 Next Steps

1. **Read the Reality Check**
   - `REALITY-AND-ROADMAP.md` - Current state & plan
   - `IMPLEMENTATION-PRIORITY.md` - Detailed tasks

2. **Understand the Architecture**
   - `README.md` - Vision & philosophy
   - `DEVELOPER-GUIDE.md` - Technical docs

3. **Start Contributing**
   - Pick a service from priority list
   - Follow the "Complete" definition
   - Submit PR with tests

---

## 🎯 Key Files

```
azora-os/
├── start-core-services.sh          # Start all services
├── test-integration.sh             # Test integration
├── REALITY-AND-ROADMAP.md          # Current state
├── IMPLEMENTATION-PRIORITY.md      # Action plan
├── services/
│   ├── api-gateway/                # Main entry point
│   ├── azora-nexus/                # Event bus
│   │   ├── engines/event-bus.js    # Pub/sub system
│   │   └── service-connector.js    # Service integration
│   ├── azora-education/            # Learning management
│   ├── azora-mint/                 # Financial engine
│   ├── azora-forge/                # Job marketplace
│   └── ai-family-service/          # AI personalities
```

---

## 💡 Tips

- **Use API Gateway** - Don't call services directly
- **Publish Events** - Let other services know what happened
- **Check Health** - Monitor service status
- **Test Integration** - Run `./test-integration.sh` often
- **Read Logs** - Services log important info

---

## 🌍 Ubuntu

**"I am because we are"**

Build together, one service at a time. 🚀

---

**Questions?** Check `REALITY-AND-ROADMAP.md` or open an issue.
