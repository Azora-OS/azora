/**
 * AZORA PRICING REPORT
 * 
 * Comprehensive pricing analytics and revenue projections dashboard
 */

import { generatePricingReport, PRICING_TIERS } from './pricing-engine';

export interface PricingReportOptions {
  className?: string;
}

export function generateHTMLReport(options: PricingReportOptions = {}): string {
  const { analytics, projections, insights } = generatePricingReport();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const tierDistributionHTML = Object.entries(analytics.usersByTier)
    .map(([tier, count]) => {
      const percentage = ((count / analytics.totalUsers) * 100).toFixed(1);
      return `
        <div class="tier-bar">
          <div class="tier-info">
            <span class="tier-name">${tier}</span>
            <span class="tier-stats">${formatNumber(count)} (${percentage}%)</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill tier-${tier.toLowerCase()}" style="width: ${percentage}%"></div>
          </div>
        </div>`;
    }).join('');

  const planDistributionHTML = Object.entries(analytics.usersByPlan)
    .map(([plan, count]) => {
      const percentage = ((count / analytics.totalUsers) * 100).toFixed(1);
      return `
        <div class="plan-item">
          <div class="plan-name">${plan.charAt(0).toUpperCase() + plan.slice(1)}</div>
          <div class="plan-count">${formatNumber(count)}</div>
          <div class="plan-percentage">${percentage}%</div>
        </div>`;
    }).join('');

  const projectionsHTML = projections
    .map((projection) => `
      <div class="table-row">
        <div>${projection.month}</div>
        <div>${formatNumber(projection.students)}</div>
        <div>${formatNumber(projection.professionals)}</div>
        <div>${formatNumber(projection.enterprise)}</div>
        <div>${formatCurrency(projection.totalRevenue)}</div>
        <div class="${projection.growth > 0 ? 'positive' : 'negative'}">
          ${projection.growth > 0 ? '+' : ''}${projection.growth}%
        </div>
      </div>`).join('');

  const tiersHTML = Object.entries(PRICING_TIERS)
    .map(([tierKey, tier]) => `
      <div class="tier-card">
        <h3>${tier.tier}</h3>
        <div class="tier-countries">${tier.countries.length} countries</div>
        <div class="tier-pricing">
          <div>Student: $${tier.student.monthly}/mo</div>
          <div>Professional: $${tier.professional.monthly}/mo</div>
          <div>Enterprise: $${tier.enterprise.monthly}/mo</div>
        </div>
      </div>`).join('');

  const insightsHTML = insights
    .map((insight) => `
      <div class="insight-item">
        <span class="insight-bullet">•</span>
        <span class="insight-text">${insight}</span>
      </div>`).join('');

  return `
    <div class="pricing-report ${options.className || ''}">
      <!-- Header -->
      <div class="report-header">
        <h1>AZORA Pricing Analytics & Projections</h1>
        <p>Geo-aware PPP pricing performance and 12-month revenue forecast</p>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Total Users</h3>
          <div class="metric-value">${formatNumber(analytics.totalUsers)}</div>
        </div>
        <div class="metric-card">
          <h3>Monthly Revenue</h3>
          <div class="metric-value">${formatCurrency(analytics.monthlyRevenue)}</div>
        </div>
        <div class="metric-card">
          <h3>Yearly Revenue</h3>
          <div class="metric-value">${formatCurrency(analytics.yearlyRevenue)}</div>
        </div>
        <div class="metric-card">
          <h3>ARPU</h3>
          <div class="metric-value">${formatCurrency(analytics.averageRevenuePerUser)}</div>
        </div>
      </div>

      <!-- User Distribution -->
      <div class="section">
        <h2>User Distribution by Tier</h2>
        <div class="tier-distribution">${tierDistributionHTML}</div>
      </div>

      <!-- Plan Distribution -->
      <div class="section">
        <h2>User Distribution by Plan</h2>
        <div class="plan-distribution">${planDistributionHTML}</div>
      </div>

      <!-- Revenue Projections -->
      <div class="section">
        <h2>12-Month Revenue Projections</h2>
        <div class="projections-table">
          <div class="table-header">
            <div>Month</div>
            <div>Students</div>
            <div>Professionals</div>
            <div>Enterprise</div>
            <div>Total Revenue</div>
            <div>Growth %</div>
          </div>
          ${projectionsHTML}
        </div>
      </div>

      <!-- Pricing Tiers Overview -->
      <div class="section">
        <h2>Pricing Tiers Overview</h2>
        <div class="tiers-grid">${tiersHTML}</div>
      </div>

      <!-- Key Insights -->
      <div class="section">
        <h2>Key Insights</h2>
        <div class="insights-list">${insightsHTML}</div>
      </div>

      <!-- Conversion Rates -->
      <div class="section">
        <h2>Conversion Metrics</h2>
        <div class="conversion-metrics">
          <div class="conversion-item">
            <div class="conversion-label">Student → Professional</div>
            <div class="conversion-rate">${(analytics.conversionRates.studentToProfessional * 100).toFixed(1)}%</div>
          </div>
          <div class="conversion-item">
            <div class="conversion-label">Professional → Enterprise</div>
            <div class="conversion-rate">${(analytics.conversionRates.professionalToEnterprise * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <style>
        .pricing-report {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .report-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .report-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .report-header p {
          font-size: 1.1rem;
          color: #666;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .metric-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .metric-card h3 {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
        }

        .section {
          margin-bottom: 3rem;
        }

        .section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
        }

        .tier-distribution {
          space-y: 1rem;
        }

        .tier-bar {
          margin-bottom: 1rem;
        }

        .tier-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .tier-name {
          font-weight: 600;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .tier-tier_1 { background: #10b981; }
        .tier-tier_2 { background: #3b82f6; }
        .tier-tier_3 { background: #f59e0b; }
        .tier-tier_4 { background: #ef4444; }

        .plan-distribution {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .plan-item {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .plan-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .plan-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2563eb;
        }

        .projections-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1.5fr 0.8fr;
          gap: 1rem;
          padding: 1rem;
        }

        .table-header {
          background: #f8f9fa;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-row {
          border-bottom: 1px solid #f3f4f6;
        }

        .table-row:hover {
          background: #f9fafb;
        }

        .positive { color: #10b981; }
        .negative { color: #ef4444; }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .tier-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .tier-card h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .tier-countries {
          color: #666;
          margin-bottom: 1rem;
        }

        .tier-pricing div {
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }

        .insights-list {
          space-y: 1rem;
        }

        .insight-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .insight-bullet {
          color: #2563eb;
          font-weight: bold;
          margin-right: 0.75rem;
          margin-top: 0.1rem;
        }

        .insight-text {
          flex: 1;
          line-height: 1.5;
        }

        .conversion-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .conversion-item {
          text-align: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .conversion-label {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .conversion-rate {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
        }
      </style>
    </div>`;
}

export function generatePricingReportHTML(): string {
  return generateHTMLReport();
}

export default generateHTMLReport;