# 📧 AZORA MAIL - Complete Email Infrastructure

## Your Own Email Service with AI Automation

Azora Mail is a complete email infrastructure service that replaces Google/Gmail with your own branded email system, powered by Elara AI for automated campaigns running 24/7.

---

## 🚀 Features

### Email Infrastructure
- ✅ **SMTP Server** - Send emails from @azora-os.ai
- ✅ **Bulk Campaigns** - Send to thousands at once
- ✅ **Personalization** - Dynamic content per recipient
- ✅ **Rate Limiting** - Prevent spam, ensure delivery
- ✅ **Analytics** - Track every email sent

### AI-Powered Automation (Elara)
- ✅ **AI Email Generation** - Elara writes professional emails
- ✅ **Autonomous Campaigns** - Runs day and night
- ✅ **Smart Scheduling** - Send at optimal times
- ✅ **Audience Segmentation** - Companies, students, general
- ✅ **Real-time Monitoring** - Live dashboard

### Branded Templates
- ✅ **Professional HTML emails** with Azora branding
- ✅ **Responsive design** - Looks great everywhere
- ✅ **Custom headers** - Your logo, your style
- ✅ **CTA buttons** - Drive action

---

## 📦 Installation

```bash
cd services/azora-mail
npm install
```

---

## ⚙️ Configuration

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Configure SMTP:**

### For Development (Local Testing):
```env
SMTP_HOST=localhost
SMTP_PORT=1025
```

Use [MailHog](https://github.com/mailhog/MailHog) or [MailDev](https://github.com/maildev/maildev) for local testing.

### For Production:

**Option 1: SendGrid (Recommended)**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Option 2: AWS SES**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_access_key
SMTP_PASS=your_aws_secret_key
```

**Option 3: Postmark**
```env
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your_postmark_token
SMTP_PASS=your_postmark_token
```

---

## 🎯 Usage

### Start the Service

```bash
npm start
```

Server runs on `http://localhost:4300`

### Open Monitoring Dashboard

Open `monitoring-dashboard.html` in your browser to see real-time email activity.

---

## 📡 API Endpoints

### Send Single Email
```bash
POST /api/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Welcome to Azora OS",
  "html": "<h1>Hello!</h1><p>Welcome to our platform.</p>",
  "from": "Azora OS <hello@azora-os.ai>"
}
```

### Send Bulk Campaign
```bash
POST /api/send-bulk
Content-Type: application/json

{
  "recipients": [
    { "email": "user1@example.com", "name": "John Doe", "company": "Tech Corp" },
    { "email": "user2@example.com", "name": "Jane Smith", "company": "StartUp Inc" }
  ],
  "subject": "Introducing Azora OS",
  "html": "<h1>Hello {{name}}!</h1><p>From {{company}}</p>",
  "campaignName": "Product Launch 2025"
}
```

### Generate AI Email
```bash
POST /api/ai/generate
Content-Type: application/json

{
  "purpose": "company",
  "recipient": {
    "name": "Tech Startup",
    "email": "founder@startup.com"
  },
  "tone": "professional",
  "context": {
    "companyName": "Tech Startup"
  }
}
```

### Get Analytics
```bash
GET /api/analytics
```

Response:
```json
{
  "totalEmails": 1543,
  "sentToday": 127,
  "byStatus": {
    "sent": 1520,
    "failed": 23
  },
  "campaigns": 8
}
```

### Get Email Logs
```bash
GET /api/logs?limit=50
```

---

## 🤖 Elara AI Automation

### Start Autonomous Email Agent

```javascript
import { ElaraEmailAgent } from './elara-integration.js'

const agent = new ElaraEmailAgent()

// Add company outreach campaign
agent.addCampaign({
  name: 'Tech Startup Outreach',
  type: 'company',
  recipients: [
    { email: 'ceo@startup.com', contactName: 'John Doe', name: 'Startup Inc' },
    // ... more companies
  ]
})

// Add student outreach campaign
agent.addCampaign({
  name: 'University Students',
  type: 'student',
  recipients: [
    { email: 'student@university.edu', name: 'Jane Smith' },
    // ... more students
  ]
})

// Start agent (runs 24/7)
await agent.start()
```

### Campaign Types

**1. Company Outreach (`company`)**
- Professional business emails
- Introduces Azora OS enterprise solutions
- Personalized with company name

**2. Student Outreach (`student`)**
- Educational focus
- Introduces Azora Sapiens
- Free resources highlight

**3. General Outreach (`general`)**
- Flexible messaging
- Introduces core platform
- Broad appeal

---

## 📧 Email Templates

### Built-in Templates Include:

1. **Professional Header**
   - Azora OS branding
   - Gradient design
   - Logo + tagline

2. **Branded Footer**
   - Links to website, GitHub, contact
   - Copyright notice
   - Unsubscribe option

3. **Responsive Design**
   - Mobile-friendly
   - Email client compatible
   - Professional typography

### Customize Templates

Edit the `generateHTML()` function in `index.js` to customize email design.

---

## 📊 Monitoring Dashboard

Open `monitoring-dashboard.html` to see:

- **Real-time stats**: Total sent, today's count, success rate
- **Live activity**: Recent emails with status
- **Campaign progress**: Active campaigns with progress bars
- **Auto-refresh**: Updates every 10 seconds

---

## 🔄 Integration with Elara IDE

Elara can automatically trigger email campaigns based on:

1. **Time-based**: Daily/weekly outreach
2. **Event-based**: New signups, milestones
3. **AI-suggested**: Optimal sending times
4. **User-initiated**: Manual campaign triggers

### Example: Elara Sending Email from IDE

```javascript
// In Elara IDE
await azoraMail.sendEmail({
  to: 'investor@vc.com',
  subject: 'Partnership Opportunity with Azora OS',
  purpose: 'company',
  context: {
    companyName: 'VC Partners'
  }
})
```

---

## 🌍 Replacing Gmail/Google

### 1. Domain Setup

**Register your domain** (e.g., azora-os.ai)

**Add DNS records:**
```
MX Record: mail.azora-os.ai (Priority: 10)
SPF Record: v=spf1 include:azora-os.ai ~all
DKIM: [generated by email service]
DMARC: v=DMARC1; p=quarantine; rua=mailto:dmarc@azora-os.ai
```

### 2. Choose Email Provider

**For Small Scale (< 100 emails/day):**
- Self-hosted (requires server management)
- Free tier of SendGrid/Mailgun

**For Medium Scale (< 10,000 emails/day):**
- SendGrid (Recommended)
- Postmark
- AWS SES

**For Large Scale (> 10,000 emails/day):**
- AWS SES + Dedicated IP
- SendGrid with dedicated IP
- Custom infrastructure

### 3. Email Clients

**Use existing clients with your domain:**
- Gmail (with custom domain)
- Outlook
- Apple Mail
- Thunderbird

**Or build custom client** integrated with Azora OS

---

## 🔒 Security Best Practices

1. **DKIM Signing**: Verify email authenticity
2. **SPF Records**: Prevent spoofing
3. **DMARC**: Monitor and prevent fraud
4. **Rate Limiting**: Prevent spam accusations
5. **Unsubscribe Links**: CAN-SPAM compliance
6. **Double Opt-in**: Verify subscribers

---

## 📈 Scaling

### Current Limits (Development):
- 100 emails per 15 minutes (rate limited)
- Single server instance

### Production Scaling:
1. **Load Balancer**: Multiple instances
2. **Job Queue**: Redis + Bull for async sending
3. **Database**: PostgreSQL for logs/campaigns
4. **CDN**: Email assets (images, attachments)
5. **Dedicated IPs**: Better deliverability

---

## 🎯 Use Cases

### 1. Product Launch
```javascript
agent.addCampaign({
  name: 'Azora OS Launch',
  type: 'general',
  recipients: emailList,
})
```

### 2. Educational Outreach
```javascript
agent.addCampaign({
  name: 'University Partnership',
  type: 'student',
  recipients: studentsList,
})
```

### 3. B2B Sales
```javascript
agent.addCampaign({
  name: 'Enterprise Sales',
  type: 'company',
  recipients: companiesList,
})
```

### 4. Investor Outreach
```javascript
await azoraMail.sendEmail({
  to: 'investor@vc.com',
  purpose: 'company',
  context: { pitch: true }
})
```

---

## 🐛 Troubleshooting

### Emails not sending?
1. Check SMTP credentials in `.env`
2. Verify SMTP host is reachable
3. Check firewall/port 587 open
4. Review logs for errors

### Emails going to spam?
1. Set up SPF, DKIM, DMARC
2. Use reputable email service
3. Warm up domain gradually
4. Add unsubscribe links
5. Monitor sender reputation

### Rate limiting issues?
1. Adjust `express-rate-limit` settings
2. Implement job queue for large campaigns
3. Use multiple SMTP accounts

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid Guide](https://docs.sendgrid.com/)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/best-practices-email-deliverability/)
- [CAN-SPAM Compliance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)

---

## 🤝 Integration Examples

### With Azora Nexus (AI)
```javascript
const emailContent = await azoraNexus.generateEmail(recipient)
await azoraMail.send(emailContent)
```

### With Azora Oracle (Analytics)
```javascript
const analytics = await azoraOracle.getEmailPerformance()
// Adjust campaigns based on insights
```

### With Azora Covenant (Legal)
```javascript
const compliant = await azoraCovenant.checkEmailCompliance(email)
if (compliant) await azoraMail.send(email)
```

---

## 🎉 You're Ready!

Start sending professional, branded emails with AI automation. Elara will work day and night to grow your reach!

```bash
npm start
# Open monitoring-dashboard.html
# Let Elara do the work! 🤖
```

---

© 2025 Azora ES (Pty) Ltd. All Rights Reserved.

