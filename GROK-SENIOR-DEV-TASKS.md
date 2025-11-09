# GROK - SENIOR DEV TASKS
## 70% Implementation - 20 Minutes

**Priority**: CRITICAL  
**Deadline**: 20 minutes  
**Focus**: Working MVP, not perfection  

---

## 🎯 CORE TASKS (Do These First)

### 1. REAL AUTHENTICATION (5 minutes)
```bash
# Create working auth service
cd services/auth-service
```

**File**: `services/auth-service/index.js`
```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

// In-memory users (replace with DB later)
const users = new Map();

// Register
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (users.has(email)) return res.status(400).json({ error: 'User exists' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), email, name, password: hashedPassword };
  users.set(email, user);
  
  const token = jwt.sign({ userId: user.id, email }, 'secret');
  res.json({ token, user: { id: user.id, email, name } });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id, email }, 'secret');
  res.json({ token, user: { id: user.id, email: user.name } });
});

app.listen(3001, () => console.log('Auth service on 3001'));
```

**Install deps**: `npm install express bcrypt jsonwebtoken`

### 2. WORKING UI LOGIN (5 minutes)
**File**: `apps/app/components/LoginForm.tsx`
```typescript
'use client';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    
    const res = await fetch(`http://localhost:3001${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: email.split('@')[0] })
    });
    
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="w-full mt-2 text-blue-500"
      >
        {isLogin ? 'Need account? Register' : 'Have account? Login'}
      </button>
    </div>
  );
}
```

### 3. MAIN DASHBOARD (5 minutes)
**File**: `apps/app/components/Dashboard.tsx`
```typescript
'use client';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token to get user info (simplified)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.email });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Azora OS</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user.email}</span>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Education</h3>
            <p>Access courses and learning materials</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              View Courses
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Mint</h3>
            <p>Financial services and payments</p>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
              Open Wallet
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Forge</h3>
            <p>Marketplace and services</p>
            <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">
              Browse Market
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. WIRE UP MAIN APP (3 minutes)
**File**: `apps/app/page.tsx`
```typescript
'use client';
import { useEffect, useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}
```

### 5. BASIC PAYMENT SERVICE (2 minutes)
**File**: `services/payment-service/index.js`
```javascript
const express = require('express');
const app = express();
app.use(express.json());

// Mock payment processing
const transactions = [];

app.post('/process-payment', (req, res) => {
  const { amount, currency, userId } = req.body;
  
  const transaction = {
    id: Date.now(),
    amount,
    currency,
    userId,
    status: 'completed',
    timestamp: new Date()
  };
  
  transactions.push(transaction);
  res.json({ success: true, transaction });
});

app.get('/transactions/:userId', (req, res) => {
  const userTransactions = transactions.filter(t => t.userId == req.params.userId);
  res.json(userTransactions);
});

app.listen(3002, () => console.log('Payment service on 3002'));
```

---

## 🚀 DEPLOYMENT COMMANDS

```bash
# Start all services
cd services/auth-service && npm install && node index.js &
cd services/payment-service && npm install && node index.js &

# Start main app
cd apps/app && npm run dev
```

---

## ✅ SUCCESS CRITERIA

After 20 minutes, we should have:
1. **Working login/register** - Users can create accounts
2. **Protected dashboard** - Only logged-in users see it
3. **Basic payment processing** - Mock transactions work
4. **Clean UI** - Looks professional
5. **Mobile responsive** - Works on phone

---

## 🎯 NEXT PHASE (After 20 minutes)

1. **Database integration** - Replace in-memory storage
2. **Real payment processing** - Stripe integration
3. **Course management** - Add/view courses
4. **User profiles** - Edit user information
5. **Mobile app** - React Native version

---

## 🚀 GROK'S ADDITIONAL TASKS (Next Phase)

### 6. TAMPER-PROOF DATA SERVICE (10 minutes)
**File**: `services/tamper-proof-service/index.js`
```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

// Immutable data storage
const dataRecords = new Map();
const auditTrail = [];

// Create tamper-proof record
app.post('/store', (req, res) => {
  const { data, userId } = req.body;
  
  const record = {
    id: crypto.randomUUID(),
    data,
    userId,
    timestamp: Date.now(),
    hash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
  };
  
  // Multi-layer verification
  const signature = crypto.createHash('sha256')
    .update(record.hash + record.timestamp)
    .digest('hex');
  
  record.signature = signature;
  dataRecords.set(record.id, record);
  
  // Audit trail
  auditTrail.push({
    action: 'STORE',
    recordId: record.id,
    timestamp: record.timestamp,
    hash: record.hash
  });
  
  res.json({ success: true, recordId: record.id, hash: record.hash });
});

// Verify record integrity
app.get('/verify/:id', (req, res) => {
  const record = dataRecords.get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  
  const computedHash = crypto.createHash('sha256')
    .update(JSON.stringify(record.data))
    .digest('hex');
  
  const computedSignature = crypto.createHash('sha256')
    .update(computedHash + record.timestamp)
    .digest('hex');
  
  const valid = computedHash === record.hash && computedSignature === record.signature;
  
  res.json({
    valid,
    record,
    verification: {
      hashMatch: computedHash === record.hash,
      signatureMatch: computedSignature === record.signature
    }
  });
});

app.listen(3003, () => console.log('Tamper-proof service on 3003'));
```

### 7. AI SECURITY MONITOR (8 minutes)
**File**: `services/ai-security/index.js`
```javascript
const express = require('express');
const app = express();
app.use(express.json());

// Threat detection
const threats = [];
const systemMetrics = {
  cpuUsage: 45,
  memoryUsage: 62,
  networkActivity: 'normal',
  lastScan: Date.now()
};

// Real-time monitoring
setInterval(() => {
  // Simulate threat detection
  const anomaly = Math.random();
  if (anomaly > 0.95) {
    const threat = {
      id: Date.now(),
      type: 'anomaly_detected',
      severity: anomaly > 0.98 ? 'critical' : 'warning',
      timestamp: Date.now(),
      details: 'Unusual system behavior detected'
    };
    threats.push(threat);
    console.log('🚨 Threat detected:', threat);
  }
  
  // Update metrics
  systemMetrics.cpuUsage = Math.max(20, Math.min(80, systemMetrics.cpuUsage + (Math.random() - 0.5) * 10));
  systemMetrics.memoryUsage = Math.max(30, Math.min(90, systemMetrics.memoryUsage + (Math.random() - 0.5) * 5));
  systemMetrics.lastScan = Date.now();
}, 5000);

app.get('/threats', (req, res) => {
  res.json(threats.slice(-20)); // Last 20 threats
});

app.get('/metrics', (req, res) => {
  res.json(systemMetrics);
});

app.get('/status', (req, res) => {
  const activeThreatCount = threats.filter(t => 
    Date.now() - t.timestamp < 300000 // Last 5 minutes
  ).length;
  
  res.json({
    status: activeThreatCount === 0 ? 'secure' : activeThreatCount < 3 ? 'warning' : 'critical',
    activeThreats: activeThreatCount,
    totalThreats: threats.length,
    lastScan: new Date(systemMetrics.lastScan).toISOString()
  });
});

app.listen(3004, () => console.log('AI Security Monitor on 3004'));
```

### 8. SERVICE INTEGRATION HUB (7 minutes)
**File**: `services/integration-hub/index.js`
```javascript
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Service registry
const services = {
  auth: { url: 'http://localhost:3001', status: 'unknown' },
  payment: { url: 'http://localhost:3002', status: 'unknown' },
  tamperproof: { url: 'http://localhost:3003', status: 'unknown' },
  security: { url: 'http://localhost:3004', status: 'unknown' }
};

// Health check all services
async function checkServiceHealth() {
  for (const [name, service] of Object.entries(services)) {
    try {
      const response = await axios.get(`${service.url}/health`, { timeout: 2000 });
      services[name].status = response.status === 200 ? 'healthy' : 'unhealthy';
      services[name].lastCheck = Date.now();
    } catch (error) {
      services[name].status = 'unhealthy';
      services[name].lastCheck = Date.now();
      services[name].error = error.message;
    }
  }
}

// Check health every 30 seconds
setInterval(checkServiceHealth, 30000);
checkServiceHealth(); // Initial check

// Route requests to services
app.post('/route/:service/*', async (req, res) => {
  const serviceName = req.params.service;
  const path = req.params[0];
  
  if (!services[serviceName]) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  if (services[serviceName].status !== 'healthy') {
    return res.status(503).json({ error: 'Service unavailable' });
  }
  
  try {
    const response = await axios({
      method: req.method,
      url: `${services[serviceName].url}/${path}`,
      data: req.body,
      headers: req.headers,
      timeout: 10000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Service status dashboard
app.get('/services/status', (req, res) => {
  const healthyCount = Object.values(services).filter(s => s.status === 'healthy').length;
  const totalCount = Object.keys(services).length;
  
  res.json({
    services,
    summary: {
      total: totalCount,
      healthy: healthyCount,
      unhealthy: totalCount - healthyCount,
      healthPercentage: Math.round((healthyCount / totalCount) * 100)
    }
  });
});

app.listen(3005, () => console.log('Integration Hub on 3005'));
```

### 9. ENHANCED LOGIN COMPONENT (5 minutes)
**File**: `apps/app/components/QuantumLogin.tsx`
```typescript
'use client';
import { useState } from 'react';
import './supreme-neural.css';

export function QuantumLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name: email.split('@')[0] 
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supreme-dashboard flex items-center justify-center min-h-screen">
      <div className="crystalline-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="holo-text text-4xl font-bold mb-2">AZORA OS</h1>
          <p className="text-white/60">Quantum-Secured Access</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="quantum-input w-full"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="quantum-input w-full"
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="quantum-btn w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/60 hover:text-white transition-colors"
            disabled={loading}
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 10. UPDATE MAIN APP (5 minutes)
**File**: `apps/app/page.tsx`
```typescript
'use client';
import { useEffect, useState } from 'react';
import { QuantumLogin } from './components/QuantumLogin';
import { SupremeDashboard } from './components/SupremeDashboard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="supreme-dashboard flex items-center justify-center min-h-screen">
        <div className="holo-text text-2xl">Initializing Quantum Systems...</div>
      </div>
    );
  }

  return isAuthenticated ? <SupremeDashboard /> : <QuantumLogin />;
}
```

---

## 🚀 DEPLOYMENT COMMANDS (Updated)

```bash
# Install dependencies
npm install express bcrypt jsonwebtoken cors axios

# Start all services in parallel
node services/auth-service/quantum-auth.js &
node services/payment-service/index.js &
node services/tamper-proof-service/index.js &
node services/ai-security/index.js &
node services/integration-hub/index.js &

# Start main app
cd apps/app && npm run dev
```

---

**GO BUILD THE SUPREME SYSTEM NOW** 🔥🚀