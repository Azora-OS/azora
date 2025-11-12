# 🎨 Azora OS Applications

**Total Apps**: 16  
**Framework**: Next.js 14+  
**Status**: Ready for Deployment

## 📱 Frontend Applications

### 🎓 Student Applications
- **student-portal** - Main student dashboard
  - Course browsing & enrollment
  - Progress tracking
  - AI tutor (Elara)
  - Token wallet

- **learn-ui** - Learning platform
  - Interactive lessons
  - Video content
  - Quizzes & assessments
  - Peer collaboration

- **student-portal-mobile** - Mobile app
  - iOS & Android
  - Offline learning
  - Push notifications

### 💼 Business Applications
- **enterprise-ui** - Business management
  - Team management
  - Analytics dashboard
  - Reporting tools
  - Admin controls

- **marketplace-ui** - Job marketplace
  - Job listings
  - Skills matching
  - Applications
  - Freelance projects

- **azora-forge** - Skills platform
  - Skill assessments
  - Portfolio building
  - Networking
  - Opportunities

### 💰 Financial Applications
- **pay-ui** - Financial dashboard
  - Wallet management
  - Transaction history
  - Token earning
  - Payments & withdrawals

- **azora-mint** - Token minting
  - Mining dashboard
  - Proof-of-Knowledge
  - Rewards tracking
  - Token analytics

### 🛠️ Developer Applications
- **dev-ui** - Developer tools
  - API testing
  - Documentation
  - Code examples
  - SDK downloads

- **azora-ide** - Integrated development
  - Code editor
  - AI assistance
  - Debugging tools
  - Version control

### 🏢 Enterprise Applications
- **master-ui** - Master control
  - System overview
  - Service management
  - Configuration
  - Monitoring

- **cloud-ui** - Cloud services
  - Infrastructure management
  - Deployment tools
  - Resource monitoring
  - Cost tracking

- **compliance-ui** - Compliance tools
  - Regulatory compliance
  - Audit trails
  - Reporting
  - Documentation

### 📊 Data Applications
- **ingestion-ui** - Data ingestion
  - Data import
  - ETL pipelines
  - Data validation
  - Processing status

- **azora-ui** - Core UI library
  - Shared components
  - Design system
  - Theme management
  - UI utilities

### 🌐 General Applications
- **app** - Main application
  - Landing page
  - Authentication
  - Navigation
  - Core features

- **web** - Web portal
  - Public website
  - Marketing pages
  - Documentation
  - Community

## 🚀 Quick Start

### Run Single App
```bash
cd apps/student-portal
npm install
npm run dev
```

### Run All Apps (Development)
```bash
npm run dev:apps
```

## 📋 App Status

| App | Status | Vercel Ready | Priority |
|-----|--------|--------------|----------|
| student-portal | ✅ Ready | Yes | High |
| enterprise-ui | ✅ Ready | Yes | High |
| marketplace-ui | ✅ Ready | Yes | High |
| pay-ui | ✅ Ready | Yes | High |
| learn-ui | ✅ Ready | Yes | Medium |
| master-ui | ✅ Ready | Yes | Medium |
| azora-mint | ✅ Ready | Yes | Medium |
| dev-ui | ✅ Ready | Yes | Low |
| cloud-ui | ✅ Ready | Yes | Low |
| compliance-ui | ✅ Ready | Yes | Low |
| ingestion-ui | ✅ Ready | Yes | Low |
| azora-ui | ✅ Ready | Yes | Core |
| app | ✅ Ready | Yes | Core |
| web | ✅ Ready | Yes | Core |
| mobile | ⚠️ Dev | No | Future |
| electron | ⚠️ Dev | No | Future |

## 🔧 Environment Variables

All apps require:
```bash
NEXT_PUBLIC_API_URL=https://azora-api-gateway.vercel.app
NEXT_PUBLIC_WS_URL=wss://azora-api-gateway.vercel.app
```

Optional:
```bash
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🎨 Design System

All apps use the Azora Design System:
- **Colors**: Ubuntu-inspired palette
- **Typography**: Inter font family
- **Components**: Shared component library
- **Icons**: Lucide React icons
- **Styling**: Tailwind CSS + Glassmorphism

## 📱 Responsive Design

All apps are fully responsive:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+
- 4K: 2560px+

## 🚀 Deployment

### Vercel (Recommended)
```bash
cd apps/student-portal
vercel --prod
```

### Manual Build
```bash
cd apps/student-portal
npm run build
npm start
```

See `/VERCEL-DEPLOYMENT.md` for detailed instructions.

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📚 Documentation

- **Component Library**: `/packages/ui/README.md`
- **Design System**: `/docs/ui/DESIGN-SYSTEM-GUIDE.md`
- **API Integration**: `/docs/api/API_DOCUMENTATION.md`

## 🤝 Contributing

See `/CONTRIBUTING.md` for contribution guidelines.

## 📄 License

Proprietary - Azora ES (Pty) Ltd

---

**Built with Ubuntu Philosophy** 💚  
*"I am because we are"*
