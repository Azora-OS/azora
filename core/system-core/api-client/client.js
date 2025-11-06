/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * Azora API Client
 * Centralized API communication layer for all subdomains
 * Implements Constitutional AI compliance and security
 */

class AzoraAPIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // ========== AUTHENTICATION ==========

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(email, password, name) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' })
  }

  async getProfile() {
    return this.request('/auth/me')
  }

  async updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ========== AZORA SAPIENS (Education) ==========

  async getEnrolledCourses() {
    return this.request('/sapiens/enrollments')
  }

  async enrollCourse(courseId) {
    return this.request(`/sapiens/courses/${courseId}/enroll`, {
      method: 'POST',
    })
  }

  async completeModule(courseId, moduleId) {
    return this.request(`/sapiens/courses/${courseId}/modules/${moduleId}/complete`, {
      method: 'POST',
    })
  }

  async getAscensionProgress() {
    return this.request('/sapiens/ascension/progress')
  }

  async getKnowledgePoints() {
    return this.request('/sapiens/knowledge-points')
  }

  async getCourses() {
    return this.request('/sapiens/courses')
  }

  // ========== AZORA MINT (Economy) ==========

  async getWalletBalance() {
    return this.request('/mint/wallet/balance')
  }

  async getTransactions(limit = 20) {
    return this.request(`/mint/transactions?limit=${limit}`)
  }

  async sendPayment(recipientId, amount, currency) {
    return this.request('/mint/transactions/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, amount, currency }),
    })
  }

  async convertCurrency(from, to, amount) {
    return this.request('/mint/converter', {
      method: 'POST',
      body: JSON.stringify({ from, to, amount }),
    })
  }

  async getUBOStatus() {
    return this.request('/mint/ubo/status')
  }

  async claimReward(rewardId) {
    return this.request(`/mint/rewards/${rewardId}/claim`, {
      method: 'POST',
    })
  }

  // ========== AZORA COMPLIANCE ==========

  async getComplianceScore() {
    return this.request('/compliance/score')
  }

  async getComplianceAlerts() {
    return this.request('/compliance/alerts')
  }

  async getRegionalStatus(region) {
    return this.request(`/compliance/regions/${region}`)
  }

  async generateComplianceReport() {
    return this.request('/compliance/reports', {
      method: 'POST',
    })
  }

  async acknowledgeAlert(alertId) {
    return this.request(`/compliance/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    })
  }

  // ========== AZORA FORGE (Marketplace) ==========

  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/forge/products?${params}`)
  }

  async getProduct(productId) {
    return this.request(`/forge/products/${productId}`)
  }

  async listProduct(productData) {
    return this.request('/forge/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async purchaseProduct(productId, buyerData) {
    return this.request(`/forge/products/${productId}/purchase`, {
      method: 'POST',
      body: JSON.stringify(buyerData),
    })
  }

  async getSellerDashboard() {
    return this.request('/forge/seller/dashboard')
  }

  async getOrderHistory() {
    return this.request('/forge/orders')
  }

  // ========== AZORA ENTERPRISE ==========

  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/enterprise/orders?${params}`)
  }

  async getOrder(orderId) {
    return this.request(`/enterprise/orders/${orderId}`)
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/enterprise/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async getTeamMembers() {
    return this.request('/enterprise/team')
  }

  async getBusinessMetrics() {
    return this.request('/enterprise/metrics')
  }

  // ========== AZORA NEXUS (Monitoring) ==========

  async getSystemHealth() {
    return this.request('/nexus/health')
  }

  async getMetrics() {
    return this.request('/nexus/metrics')
  }

  async getAlerts() {
    return this.request('/nexus/alerts')
  }

  async getServiceStatus() {
    return this.request('/nexus/services')
  }

  // ========== AZORA AEGIS (Governance) ==========

  async getConstitutionalStatus() {
    return this.request('/aegis/constitution/status')
  }

  async getGovernanceProposals() {
    return this.request('/aegis/governance/proposals')
  }

  async submitGovernanceProposal(proposal) {
    return this.request('/aegis/governance/proposals', {
      method: 'POST',
      body: JSON.stringify(proposal),
    })
  }

  async voteOnProposal(proposalId, vote) {
    return this.request(`/aegis/governance/proposals/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    })
  }

  // ========== AZORA ORACLE (Intelligence) ==========

  async getExchangeRates() {
    return this.request('/oracle/rates')
  }

  async convertWithRate(from, to, amount) {
    return this.request(`/oracle/rates/convert`, {
      method: 'POST',
      body: JSON.stringify({ from, to, amount }),
    })
  }

  async getKnowledgeGraph() {
    return this.request('/oracle/knowledge-graph')
  }

  async searchKnowledge(query) {
    return this.request(`/oracle/knowledge/search`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }
}

// Create singleton instance
const apiClient = new AzoraAPIClient(process.env.REACT_APP_API_URL || '/api')

export default apiClient
