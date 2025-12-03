# Azora UI/UX Development Guide

**Purpose**: Streamline UI/UX development for the 6 scaffolded apps  
**Status**: Ready for Development  
**Last Updated**: 2025-11-25

---

## 🎯 Overview

This guide helps you rapidly develop premium UI/UX for the scaffolded apps by leveraging existing code patterns and the Azora Design System.

**Scaffolded Apps Needing UI/UX:**
1. `azora-mint` - Token Mining Dashboard
2. `azora-classroom` - Live Virtual Classrooms
3. `azora-library` - Knowledge Base
4. `azora-oracle` - AI Business Assistant
5. `azora-research-center` - Academic Research
6. `azora-master` - System Administration

---

## 🎨 Design System

### Using @azora/shared-design

All apps use the centralized design system:

```typescript
import { 
  AppLayout,           // Main app layout with sidebar
  AccessibleCard,      // Premium glassmorphism card
  GradientText,        // Gradient text component
  Button,              // Premium button with variants
  FinanceDashboard,    // Financial widgets
  useWallet            // Wallet data hook
} from '@azora/shared-design';
```

### Color Palette

```css
/* Primary Colors */
--primary: #3b82f6;        /* Blue */
--primary-foreground: #fff;

/* Background */
--background: #0f172a;     /* Dark slate */
--foreground: #f8fafc;

/* Card */
--card: rgba(255,255,255,0.05);  /* Glassmorphism */
--card-foreground: #f8fafc;

/* Accent */
--accent: #8b5cf6;         /* Purple */
--muted: #64748b;          /* Gray */
```

### Typography

```typescript
// Headings
<h1 className="text-6xl font-bold tracking-tighter">
  Welcome to <GradientText>App Name</GradientText>
</h1>

// Body
<p className="text-xl text-gray-400 max-w-2xl mx-auto">
  Description text
</p>
```

---

## 📋 Development Workflow

### Step 1: Study Existing Apps

**Best Reference Apps:**
1. **azora-sapiens** - Complete learning platform with multiple pages
2. **azora-jobspaces** - Search, filter, and card layouts
3. **azora-buildspaces** - Complex workspace UI

**What to Look For:**
- Page layouts and navigation patterns
- Card designs and hover effects
- Form inputs and validation
- Data fetching patterns
- Loading states and error handling

### Step 2: Create Page Structure

**Standard Page Template:**

```typescript
'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from backend service
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:PORT/api/endpoint');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout appName="App Name">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout appName="App Name" userName="User Name">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold mb-4">
            <GradientText>Page Title</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Page description
          </p>
        </motion.div>

        {/* Content goes here */}
      </div>
    </AppLayout>
  );
}
```

### Step 3: Add Backend Integration

**Service Endpoints:**

```typescript
// azora-mint
const MINT_API = 'http://localhost:4008';
// GET /api/wallet/:userId
// GET /api/mining/status
// POST /api/mining/start

// azora-classroom
const CLASSROOM_API = 'http://localhost:4009';
// GET /api/sessions
// POST /api/sessions/create
// GET /api/sessions/:id

// azora-library
const LIBRARY_API = 'http://localhost:4010';
// GET /api/resources
// GET /api/resources/:id
// POST /api/resources/search

// azora-oracle
const ORACLE_API = 'http://localhost:4011';
// POST /api/insights/generate
// GET /api/workflows
// POST /api/analytics/predict

// azora-research-center
const RESEARCH_API = 'http://localhost:4012';
// GET /api/projects
// POST /api/projects/create
// GET /api/publications
```

### Step 4: Implement Features

**Common Patterns:**

#### Search & Filter
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState('All');

const filteredItems = items.filter(item => {
  const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

// UI
<input
  type="text"
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full px-6 py-4 rounded-xl bg-card/50 border border-border"
/>
```

#### Card Grid
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <AccessibleCard className="p-6 hover:border-primary/50 transition-all">
        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
        <p className="text-gray-400 mb-4">{item.description}</p>
        <Button variant="primary">View Details</Button>
      </AccessibleCard>
    </motion.div>
  ))}
</div>
```

#### Form Handling
```typescript
const [formData, setFormData] = useState({
  name: '',
  description: ''
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch('API_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await response.json();
    // Handle success
  } catch (error) {
    // Handle error
  }
};

// UI
<form onSubmit={handleSubmit} className="space-y-4">
  <input
    type="text"
    value={formData.name}
    onChange={(e) => setFormData({...formData, name: e.target.value})}
    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border"
  />
  <Button type="submit">Submit</Button>
</form>
```

---

## 🎯 App-Specific Guides

### 1. Azora Mint

**Key Pages:**
- `/` - Mining dashboard with stats
- `/wallet` - Token wallet view
- `/rewards` - Rewards history
- `/staking` - Staking interface

**Features to Implement:**
- Real-time mining status
- Token balance display
- Mining controls (start/stop)
- Rewards tracking chart
- Staking calculator

**Reference:**
- Copy wallet integration from `azora-sapiens/app/page.tsx`
- Use `FinanceDashboard` component
- Backend: `services/azora-mint`

---

### 2. Azora Classroom

**Key Pages:**
- `/` - Active sessions list
- `/create` - Create new session
- `/session/[id]` - Live session view
- `/recordings` - Recorded sessions

**Features to Implement:**
- Session list with filters
- Create session form
- Live video interface (WebRTC)
- Whiteboard canvas
- Chat interface
- Recording controls

**Reference:**
- Copy card layouts from `azora-jobspaces`
- Use real-time updates (Socket.io)
- Backend: `services/azora-classroom`

---

### 3. Azora Library

**Key Pages:**
- `/` - Resource browser
- `/search` - Advanced search
- `/resource/[id]` - Resource detail
- `/collections` - Curated collections

**Features to Implement:**
- Resource grid with categories
- Advanced search with filters
- Resource preview
- Download/bookmark functionality
- Collections management

**Reference:**
- Copy course browsing from `azora-sapiens/app/courses`
- Use search patterns from `azora-jobspaces`
- Backend: `services/azora-library`

---

### 4. Azora Oracle

**Key Pages:**
- `/` - Dashboard with insights
- `/insights` - AI-generated insights
- `/workflows` - Automated workflows
- `/analytics` - Predictive analytics

**Features to Implement:**
- AI chat interface
- Insights cards with charts
- Workflow builder
- Analytics dashboard
- Recommendations engine

**Reference:**
- Copy dashboard from `azora-buildspaces`
- Use AI chat patterns (similar to Elara integration)
- Backend: `services/ai-family-service`

---

### 5. Azora Research Center

**Key Pages:**
- `/` - Projects overview
- `/projects/[id]` - Project details
- `/publications` - Publications list
- `/collaborate` - Collaboration tools

**Features to Implement:**
- Project cards with status
- Publication browser
- Collaboration workspace
- Data analysis tools
- Grant tracking

**Reference:**
- Copy project layouts from `azora-buildspaces`
- Use card grids from `azora-jobspaces`
- Backend: `services/azora-research-center`

---

### 6. Azora Master

**Key Pages:**
- `/` - System overview dashboard
- `/users` - User management
- `/services` - Service monitoring
- `/config` - Configuration
- `/logs` - Audit logs

**Features to Implement:**
- System health dashboard
- User management table
- Service status cards
- Configuration forms
- Log viewer

**Reference:**
- Already has components in `apps/azora-master/components`
- Use dashboard patterns from `azora-buildspaces`
- Backend: `services/health-monitor`

---

## 🚀 Quick Start Commands

### Development
```bash
# Start a single app
cd apps/azora-mint
npm install
npm run dev

# Start backend service
cd services/azora-mint
npm install
npm run dev

# Run both in parallel (use separate terminals)
```

### Testing
```bash
# Test the app
npm run dev
# Open http://localhost:3000

# Test API integration
curl http://localhost:4008/api/health
```

---

## 📦 Component Library

### Available Components

```typescript
// Layout
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';

// UI Components
import { 
  AccessibleCard,
  GradientText,
  Button,
  PremiumButton 
} from '@azora/shared-design';

// Financial
import { 
  FinanceDashboard,
  useWallet 
} from '@azora/shared-design';

// Icons
import { 
  Search, 
  Filter, 
  Plus, 
  Settings,
  // ... 1000+ icons
} from 'lucide-react';
```

### Creating Custom Components

```typescript
// components/CustomCard.tsx
import { AccessibleCard } from '@azora/shared-design';

export function CustomCard({ title, children }) {
  return (
    <AccessibleCard className="p-6 hover:border-primary/50 transition-all">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </AccessibleCard>
  );
}
```

---

## 🎨 Styling Guidelines

### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}
```

### Gradients
```css
.gradient-text {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Animations
```typescript
// Fade in on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// Stagger children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Module not found: @azora/shared-design**
```bash
# From root directory
npm install
```

**2. API connection refused**
```bash
# Make sure backend service is running
cd services/azora-mint
npm run dev
```

**3. Tailwind styles not applying**
```bash
# Check tailwind.config.ts includes correct paths
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
],
```

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

### Internal Docs
- `/packages/@azora/shared-design/README.md` - Design system
- `/docs/api/API_DOCUMENTATION.md` - API reference
- `/apps/README.md` - Apps overview

---

## ✅ Checklist for Each App

- [ ] Create main dashboard page
- [ ] Implement data fetching from backend
- [ ] Add search and filter functionality
- [ ] Create detail pages
- [ ] Add forms for data creation
- [ ] Implement loading states
- [ ] Add error handling
- [ ] Test responsive design
- [ ] Add animations
- [ ] Integrate with backend service
- [ ] Test all user flows
- [ ] Optimize performance

---

**Ready to build! The code is already there, just needs the UI/UX polish.** 🚀
