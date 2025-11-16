# Azora OS Subscription Tiers

## Overview

Azora OS offers three subscription tiers designed to serve different user segments: students, educators, and enterprises. Each tier provides increasing levels of features and support.

---

## Tier Comparison Matrix

| Feature | Free | Pro ($9.99/mo) | Enterprise ($99/mo) |
|---------|------|----------------|-------------------|
| **Core Features** |
| Courses Access | Limited (5) | Unlimited | Unlimited |
| Course Upload | No | Yes (5/month) | Unlimited |
| Student Limit | N/A | N/A | Custom |
| **Learning Features** |
| Certificates | No | Yes | Yes |
| Progress Tracking | Basic | Advanced | Advanced + Analytics |
| Offline Access | No | Yes | Yes |
| **Gamification** |
| Token Rewards | Basic (50/month) | Full (500/month) | Full (5000/month) |
| Leaderboards | Global Only | Global + Friends | Global + Friends + Class |
| Badges | 5 Available | All Available | All Available |
| **Marketplace** |
| Sell Courses | No | Yes | Yes |
| Revenue Share | N/A | 70% | 75% |
| Instructor Analytics | No | Yes | Advanced |
| **Support** |
| Email Support | Community | Priority (24h) | Dedicated (4h) |
| Live Chat | No | Yes | Yes |
| Phone Support | No | No | Yes |
| **Admin Features** |
| User Management | No | No | Yes |
| Custom Branding | No | No | Yes |
| White-Label | No | No | Yes |
| SSO Integration | No | No | Yes |
| API Access | No | No | Yes |
| Custom Domain | No | No | Yes |
| **Compliance** |
| GDPR Compliance | Yes | Yes | Yes |
| Data Export | Yes | Yes | Yes |
| Audit Logs | No | No | Yes |
| SLA Guarantee | No | No | 99.9% |

---

## Tier Details

### Free Tier

**Target Users**: Students exploring the platform, casual learners

**Price**: $0/month

**Features**:
- Access to 5 free courses
- Basic progress tracking
- 50 AZR tokens per month
- Global leaderboard access
- 5 available badges
- Community email support
- GDPR compliance and data export

**Limitations**:
- Cannot upload courses
- Cannot sell courses
- Limited token rewards
- No offline access
- No certificates
- No priority support

**Use Cases**:
- High school students trying the platform
- Casual learners exploring content
- Teachers evaluating the platform

---

### Pro Tier ($9.99/month)

**Target Users**: Active students, educators, content creators

**Price**: $9.99/month (billed monthly or annually at $99.90)

**Features**:
- Unlimited course access
- Upload up to 5 courses per month
- Sell courses (70% revenue share)
- Advanced progress tracking
- 500 AZR tokens per month
- Global and friend leaderboards
- All available badges
- Certificates for completed courses
- Offline course access
- Instructor analytics dashboard
- Priority email support (24h response)
- Live chat support
- GDPR compliance and data export

**Limitations**:
- No white-label features
- No custom branding
- No SSO integration
- No API access
- No dedicated support

**Use Cases**:
- University students
- Active educators
- Content creators monetizing courses
- Professional development seekers

---

### Enterprise Tier ($99/month)

**Target Users**: Schools, universities, corporations, organizations

**Price**: $99/month (custom pricing available for large deployments)

**Features**:
- Unlimited everything
- Unlimited course uploads
- Sell courses (75% revenue share)
- Advanced analytics and reporting
- 5000 AZR tokens per month
- Global, friend, and class leaderboards
- All badges and custom badges
- Certificates with custom branding
- Offline access for all content
- Advanced instructor analytics
- User management dashboard
- Custom branding and white-label
- Custom domain support
- SSO integration (SAML/OAuth)
- Full API access
- Dedicated account manager
- Priority phone support (4h response)
- Live chat support
- Audit logs and compliance reporting
- 99.9% SLA guarantee
- Custom integrations
- Advanced security features

**Unlimited Capabilities**:
- Student accounts
- Course uploads
- API calls
- Storage
- Bandwidth
- Support tickets

**Use Cases**:
- Universities and colleges
- K-12 school districts
- Corporate training departments
- Government agencies
- NGOs and non-profits
- EdTech platforms

---

## Feature Definitions

### Core Features

**Courses Access**: Number of courses available to the user
- Free: 5 curated courses
- Pro: All courses in marketplace
- Enterprise: All courses + custom content

**Course Upload**: Ability to create and publish courses
- Free: Not available
- Pro: 5 courses per month
- Enterprise: Unlimited

**Student Limit**: Maximum number of students (for Enterprise)
- Enterprise: Custom based on contract

### Learning Features

**Certificates**: Digital certificates upon course completion
- Free: Not available
- Pro: Standard certificate
- Enterprise: Custom branded certificate

**Progress Tracking**: Monitoring student learning progress
- Free: Basic (completion %)
- Pro: Advanced (time spent, quiz scores, etc.)
- Enterprise: Advanced + analytics dashboard

**Offline Access**: Download courses for offline viewing
- Free: Not available
- Pro: Available
- Enterprise: Available

### Gamification

**Token Rewards**: AZR tokens earned for course completion
- Free: 50 tokens/month (basic activities)
- Pro: 500 tokens/month (all activities)
- Enterprise: 5000 tokens/month (all activities + bonuses)

**Leaderboards**: Competitive rankings
- Free: Global only
- Pro: Global + Friends
- Enterprise: Global + Friends + Class

**Badges**: Achievement badges
- Free: 5 available
- Pro: All available
- Enterprise: All + custom badges

### Marketplace

**Sell Courses**: Ability to monetize courses
- Free: Not available
- Pro: Available (70% revenue share)
- Enterprise: Available (75% revenue share)

**Instructor Analytics**: Dashboard for course performance
- Free: Not available
- Pro: Basic analytics
- Enterprise: Advanced analytics

### Support

**Email Support**: Response time guarantees
- Free: Community (no SLA)
- Pro: 24 hours
- Enterprise: 4 hours

**Live Chat**: Real-time support
- Free: Not available
- Pro: Available
- Enterprise: Available

**Phone Support**: Direct phone support
- Free: Not available
- Pro: Not available
- Enterprise: Available

### Admin Features

**User Management**: Manage users and permissions
- Free: Not available
- Pro: Not available
- Enterprise: Available

**Custom Branding**: White-label the platform
- Free: Not available
- Pro: Not available
- Enterprise: Available

**SSO Integration**: Single sign-on
- Free: Not available
- Pro: Not available
- Enterprise: Available (SAML/OAuth)

**API Access**: Programmatic access
- Free: Not available
- Pro: Not available
- Enterprise: Full access

---

## Pricing Strategy

### Monthly Pricing
- Free: $0
- Pro: $9.99
- Enterprise: $99.00 (or custom)

### Annual Pricing (20% discount)
- Free: $0
- Pro: $99.90 (save $19.98)
- Enterprise: $990.00 (save $198.00)

### Enterprise Custom Pricing
- Based on number of users
- Based on features required
- Volume discounts available
- Multi-year contracts available

---

## Upgrade/Downgrade Policy

### Upgrade
- Immediate activation of new tier features
- Prorated charges for remainder of billing cycle
- No cancellation penalty

### Downgrade
- Takes effect at next billing cycle
- No refunds for current cycle
- Features downgraded at cycle end

### Cancellation
- Immediate cancellation available
- Pro-rata refund for unused portion
- 30-day notice for Enterprise

---

## Feature Access Control

### Implementation

Each feature is controlled by a permission matrix:

```typescript
interface FeatureMatrix {
  free: string[]
  pro: string[]
  enterprise: string[]
}

const FEATURES: FeatureMatrix = {
  free: [
    'view_courses',
    'basic_progress_tracking',
    'global_leaderboard',
    'basic_tokens',
    'community_support'
  ],
  pro: [
    ...free,
    'upload_courses',
    'sell_courses',
    'advanced_progress_tracking',
    'offline_access',
    'certificates',
    'friend_leaderboard',
    'priority_support',
    'live_chat'
  ],
  enterprise: [
    ...pro,
    'unlimited_uploads',
    'user_management',
    'custom_branding',
    'white_label',
    'sso_integration',
    'api_access',
    'dedicated_support',
    'phone_support',
    'audit_logs',
    'class_leaderboard'
  ]
}
```

---

## Success Metrics

### Adoption
- Target: 1000 Free users by month 1
- Target: 100 Pro users by month 1
- Target: 10 Enterprise customers by month 1

### Revenue
- Target: $1K MRR from Pro tier by month 1
- Target: $1K MRR from Enterprise tier by month 1
- Target: $10K MRR total by month 3

### Retention
- Target: 90% monthly retention for Pro
- Target: 95% annual retention for Enterprise
- Target: <1% churn rate

### Conversion
- Target: 10% Free to Pro conversion
- Target: 5% Pro to Enterprise conversion

---

## Notes

- All pricing in USD
- Billing cycles start on subscription date
- Automatic renewal enabled by default
- Easy cancellation available anytime
- No long-term contracts required (except Enterprise)
- Volume discounts available for Enterprise
- Educational institutions may qualify for discounts

