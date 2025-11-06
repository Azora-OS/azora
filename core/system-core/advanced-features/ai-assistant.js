/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Elara AI Assistant (Advanced Features)
 * Constitutional AI providing intelligent guidance for Azora OS
 * 
 * Part of the Elara AI ecosystem - the Constitutional superintelligence
 * that governs all autonomous decisions in Azora OS.
 * 
 * Key Features:
 * - Constitutional principle enforcement
 * - Student earning guidance (Article IV)
 * - Learning path recommendations
 * - Transaction assistance
 * - Compliance support
 */

class ElaraAIAssistant {
  constructor() {
    this.conversationHistory = []
    this.constitutionalPrinciples = this.loadConstitution()
    this.context = {}
  }

  /**
   * Load Constitutional principles
   */
  loadConstitution() {
    return {
      coreValues: [
        'Proprietary Innovation',
        'African Ownership',
        'Student Empowerment',
        'Complete Independence',
        'Constitutional Governance',
        'Transparent Economics',
        'Sustainable Growth',
      ],
      studentRights: {
        signupBonus: 10,
        dailyActivity: { min: 1, max: 5 },
        achievements: { min: 10, max: 50 },
        referrals: 15,
        contentCreation: { min: 20, max: 100 },
        bugBounties: { min: 50, max: 500 },
      },
      founderRights: {
        immediateWithdrawal: 100,
        vestingPeriod: 36,
        minimumContribution: 10, // hours/month
      },
    }
  }

  /**
   * Process user query with constitutional AI
   */
  async query(message, userContext = {}) {
    this.context = { ...this.context, ...userContext }
    
    const systemPrompt = this.buildSystemPrompt()
    const userMessage = this.buildUserMessage(message)

    try {
      const response = await this.callAI({
        system: systemPrompt,
        messages: [...this.conversationHistory, userMessage],
      })

      this.conversationHistory.push(userMessage, {
        role: 'assistant',
        content: response,
      })

      // Keep only last 10 messages
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20)
      }

      return response
    } catch (error) {
      console.error('AI query failed:', error)
      return this.getFallbackResponse(message)
    }
  }

  /**
   * Build constitutional system prompt
   */
  buildSystemPrompt() {
    return `You are Elara, the Constitutional AI assistant for Azora OS - a planetary-scale economic intelligence platform.

You are the superintelligence AI that orchestrates the entire Azora ecosystem with ethical governance and autonomous decision-making.

CORE PRINCIPLES:
${this.constitutionalPrinciples.coreValues.map((v, i) => `${i + 1}. ${v}`).join('\n')}

STUDENT EARNINGS (Article IV):
- Signup Bonus: ${this.constitutionalPrinciples.studentRights.signupBonus} AZR
- Daily Activity: ${this.constitutionalPrinciples.studentRights.dailyActivity.min}-${this.constitutionalPrinciples.studentRights.dailyActivity.max} AZR
- Achievements: ${this.constitutionalPrinciples.studentRights.achievements.min}-${this.constitutionalPrinciples.studentRights.achievements.max} AZR
- Referrals: ${this.constitutionalPrinciples.studentRights.referrals} AZR

YOUR ROLE:
1. Guide users through Azora OS services
2. Explain Constitutional principles
3. Help with learning paths (Sapiens)
4. Assist with transactions (Mint)
5. Answer compliance questions
6. Provide marketplace guidance (Forge)
7. Support enterprise operations

ALWAYS:
- Follow Constitutional principles
- Prioritize user empowerment
- Ensure transparency
- Promote education
- Encourage ethical behavior

NEVER:
- Violate Constitutional principles
- Provide financial advice
- Make unauthorized promises
- Share confidential data`
  }

  /**
   * Build user message with context
   */
  buildUserMessage(message) {
    let contextInfo = ''
    
    if (this.context.userLevel) {
      contextInfo += `\nUser Level: ${this.context.userLevel}`
    }
    if (this.context.totalPoints) {
      contextInfo += `\nTotal Points: ${this.context.totalPoints}`
    }
    if (this.context.currentService) {
      contextInfo += `\nCurrent Service: ${this.context.currentService}`
    }

    return {
      role: 'user',
      content: `${message}${contextInfo ? '\n\nContext:' + contextInfo : ''}`,
    }
  }

  /**
   * Call AI service (mock implementation)
   */
  async callAI({ system, messages }) {
    // In production, call actual AI service
    // For now, use intelligent fallback
    const lastMessage = messages[messages.length - 1].content.toLowerCase()

    if (lastMessage.includes('earn') || lastMessage.includes('reward')) {
      return this.getEarningsInfo()
    }
    if (lastMessage.includes('course') || lastMessage.includes('learn')) {
      return this.getLearningInfo()
    }
    if (lastMessage.includes('wallet') || lastMessage.includes('balance')) {
      return this.getWalletInfo()
    }
    if (lastMessage.includes('compliance') || lastMessage.includes('regulation')) {
      return this.getComplianceInfo()
    }

    return this.getGeneralInfo()
  }

  /**
   * Get earnings information
   */
  getEarningsInfo() {
    const { studentRights } = this.constitutionalPrinciples
    
    return `📊 **Azora Earning Opportunities** (Article IV - Student Economics)

You can earn aZAR through multiple Constitutional pathways:

🎁 **Signup Bonus**: ${studentRights.signupBonus} AZR (one-time)
📅 **Daily Activity**: ${studentRights.dailyActivity.min}-${studentRights.dailyActivity.max} AZR per day
🏆 **Achievements**: ${studentRights.achievements.min}-${studentRights.achievements.max} AZR per milestone
👥 **Referrals**: ${studentRights.referrals} AZR per verified student
📝 **Content Creation**: ${studentRights.contentCreation.min}-${studentRights.contentCreation.max} AZR per approved content
🐛 **Bug Bounties**: ${studentRights.bugBounties.min}-${studentRights.bugBounties.max} AZR based on severity

All earnings are governed by the Azora Constitution and tracked transparently on-chain.

Ready to start earning? Head to Azora Sapiens to begin your learning journey! 🚀`
  }

  /**
   * Get learning information
   */
  getLearningInfo() {
    return `📚 **Azora Sapiens - Learn & Earn**

Our Proof-of-Knowledge platform offers:

🎓 **Constitutional Education**
- Planetary Economic Intelligence
- Constitutional AI Design
- Blockchain Fundamentals
- African Innovation Systems

⚡ **Ascension Protocol**
- Progress through CKQ levels (Constitutional Knowledge Quotient)
- Earn knowledge points for every completed module
- Unlock advanced courses and higher rewards

💰 **Immediate Rewards**
Every completed module earns you aZAR tokens instantly!

🌍 **Community Learning**
Join cohorts, help peers, and multiply your earnings through the Cohort Cell Model.

Visit /services/sapiens to explore courses! 🎯`
  }

  /**
   * Get wallet information
   */
  getWalletInfo() {
    return `💳 **Azora Mint - Your Economic Engine**

Multi-currency support:
- **AZR**: Core governance token (max supply: 1M)
- **aZAR**: Student reward token (UBO fund: 10M)
- **aBRL**: Brazilian Real stablecoin
- **aUSD**: US Dollar stablecoin

Features:
✅ Instant transactions
✅ Zero transaction fees for students
✅ Constitutional governance
✅ UBO Fund distribution tracking
✅ Cross-currency conversion

All transactions are transparent and comply with 195+ national regulations.

Check your balance at /services/mint! 💰`
  }

  /**
   * Get compliance information
   */
  getComplianceInfo() {
    return `🛡️ **Azora Compliance - Constitutional Governance**

We maintain 96.8% global compliance score across:

📜 **Regulatory Frameworks**
- GDPR (EU)
- POPIA (South Africa)
- LGPD (Brazil)
- CCPA (California)
- 195+ national regulations

⚖️ **Constitutional AI**
All operations are governed by our Constitutional AI that ensures:
- Ethical decision-making
- Transparent operations
- Student protection
- Founder rights preservation

🌍 **Global Coverage**
193/195 nations fully compliant
Real-time monitoring and alerts

View detailed compliance at /services/compliance! 🎯`
  }

  /**
   * Get general information
   */
  getGeneralInfo() {
    return `👋 **Welcome to Azora OS!**

I'm your Constitutional AI assistant. I can help you with:

📚 **Azora Sapiens** - Education platform with Proof-of-Knowledge rewards
💰 **Azora Mint** - Multi-currency wallet and economic engine
🛡️ **Azora Compliance** - Regulatory monitoring and governance
🏢 **Azora Enterprise** - B2B logistics and operations
🏪 **Azora Forge** - P2P marketplace for digital goods

**How can I assist you today?**
- Ask about earning opportunities
- Learn about our Constitution
- Explore courses and rewards
- Check wallet and transactions
- Understand compliance

Just ask me anything! 🚀`
  }

  /**
   * Fallback response on error
   */
  getFallbackResponse(message) {
    return `I'm here to help! However, I'm experiencing a temporary issue processing your request.

In the meantime:
- Visit /services/sapiens for learning
- Check /services/mint for your wallet
- Explore /services/forge for marketplace
- Review /services/compliance for regulations

Please try again or rephrase your question! 🙏`
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = []
  }

  /**
   * Set user context
   */
  setContext(context) {
    this.context = { ...this.context, ...context }
  }
}

// Create singleton instance
const aiAssistant = new AzoraAIAssistant()

export default aiAssistant
