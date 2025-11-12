/**
 * AZORA PRICING REPORT
 * 
 * Comprehensive pricing analytics and revenue projections dashboard
 */

import { generatePricingReport, PRICING_TIERS } from './pricing-engine';

export function generatePricingReportHTML(): string {
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

  return `<!DOCTYPE html>
<html>
<head>
  <title>AZORA Pricing Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; background: #f8f9fa; }
    .pricing-report { max-width: 1200px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .report-header { text-align: center; margin-bottom: 3rem; }
    .report-header h1 { font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5rem; }
    .report-header p { font-size: 1.1rem; color: #666; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center; }
    .metric-card h3 { font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase; opacity: 0.9; }
    .metric-value { font-size: 2rem; font-weight: 700; }
    .section { margin-bottom: 3rem; }
    .section h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #1a1a1a; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    .tier-bar { margin-bottom: 1rem; }
    .tier-info { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .tier-name { font-weight: 600; }
    .progress-bar { height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 6px; }
    .tier-tier_1 { background: linear-gradient(90deg, #10b981, #059669); }
    .tier-tier_2 { background: linear-gradient(90deg, #3b82f6, #2563eb); }
    .tier-tier_3 { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .tier-tier_4 { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .plan-distribution { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .plan-item { background: #f8f9fa; padding: 1.5rem; border-radius: 8px; text-align: center; border: 2px solid transparent; transition: all 0.3s; }
    .plan-item:hover { border-color: #3b82f6; transform: translateY(-2px); }
    .plan-name { font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
    .plan-count { font-size: 1.5rem; font-weight: 700; color: #2563eb; }
    .projections-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .table-header, .table-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1.5fr 0.8fr; gap: 1rem; padding: 1rem; }
    .table-header { background: #374151; color: white; font-weight: 600; }
    .table-row { border-bottom: 1px solid #f3f4f6; }
    .table-row:nth-child(even) { background: #f9fafb; }
    .positive { color: #10b981; font-weight: 600; }
    .negative { color: #ef4444; font-weight: 600; }
    .tiers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .tier-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; transition: all 0.3s; }
    .tier-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .tier-card h3 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
    .tier-countries { color: #666; margin-bottom: 1rem; font-size: 0.9rem; }
    .tier-pricing div { margin-bottom: 0.25rem; font-size: 0.9rem; }
    .insight-item { display: flex; align-items: flex-start; margin-bottom: 1rem; padding: 1rem; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; }
    .insight-bullet { color: #3b82f6; font-weight: bold; margin-right: 0.75rem; font-size: 1.2rem; }
    .insight-text { flex: 1; line-height: 1.5; }
    .conversion-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
    .conversion-item { text-align: center; padding: 2rem; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 12px; }
    .conversion-label { font-weight: 600; margin-bottom: 0.5rem; opacity: 0.9; }
    .conversion-rate { font-size: 2.5rem; font-weight: 700; }
  </style>
</head>
<body>
  <div class="pricing-report">
    <div class="report-header">
      <h1>🚀 AZORA Pricing Analytics & Projections</h1>
      <p>Geo-aware PPP pricing performance and 12-month revenue forecast</p>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <h3>👥 Total Users</h3>
        <div class="metric-value">${formatNumber(analytics.totalUsers)}</div>
      </div>
      <div class="metric-card">
        <h3>💰 Monthly Revenue</h3>
        <div class="metric-value">${formatCurrency(analytics.monthlyRevenue)}</div>
      </div>
      <div class="metric-card">
        <h3>📈 Yearly Revenue</h3>
        <div class="metric-value">${formatCurrency(analytics.yearlyRevenue)}</div>
      </div>
      <div class="metric-card">
        <h3>💎 ARPU</h3>
        <div class="metric-value">${formatCurrency(analytics.averageRevenuePerUser)}</div>
      </div>
    </div>

    <div class="section">
      <h2>🌍 User Distribution by Geographic Tier</h2>
      <div class="tier-distribution">
        ${Object.entries(analytics.usersByTier).map(([tier, count]) => {
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
        }).join('')}
      </div>
    </div>

    <div class="section">
      <h2>💼 User Distribution by Plan</h2>
      <div class="plan-distribution">
        ${Object.entries(analytics.usersByPlan).map(([plan, count]) => {
          const percentage = ((count / analytics.totalUsers) * 100).toFixed(1);
          const emoji = plan === 'student' ? '🎓' : plan === 'professional' ? '💼' : '🏢';
          return `
            <div class="plan-item">
              <div class="plan-name">${emoji} ${plan.charAt(0).toUpperCase() + plan.slice(1)}</div>
              <div class="plan-count">${formatNumber(count)}</div>
              <div class="plan-percentage">${percentage}%</div>
            </div>`;
        }).join('')}
      </div>
    </div>

    <div class="section">
      <h2>📊 12-Month Revenue Projections</h2>
      <div class="projections-table">
        <div class="table-header">
          <div>Month</div>
          <div>Students</div>
          <div>Professionals</div>
          <div>Enterprise</div>
          <div>Total Revenue</div>
          <div>Growth %</div>
        </div>
        ${projections.map((projection) => `
          <div class="table-row">
            <div>${projection.month}</div>
            <div>${formatNumber(projection.students)}</div>
            <div>${formatNumber(projection.professionals)}</div>
            <div>${formatNumber(projection.enterprise)}</div>
            <div>${formatCurrency(projection.totalRevenue)}</div>
            <div class="${projection.growth > 0 ? 'positive' : 'negative'}">
              ${projection.growth > 0 ? '+' : ''}${projection.growth}%
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2>💰 Pricing Tiers Overview</h2>
      <div class="tiers-grid">
        ${Object.entries(PRICING_TIERS).map(([, tier]) => `
          <div class="tier-card">
            <h3>${tier.tier}</h3>
            <div class="tier-countries">🌍 ${tier.countries.length} countries</div>
            <div class="tier-pricing">
              <div>🎓 Student: $${tier.student.monthly}/mo</div>
              <div>💼 Professional: $${tier.professional.monthly}/mo</div>
              <div>🏢 Enterprise: $${tier.enterprise.monthly}/mo</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2>💡 Key Insights</h2>
      <div class="insights-list">
        ${insights.map((insight) => `
          <div class="insight-item">
            <span class="insight-bullet">💡</span>
            <span class="insight-text">${insight}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2>🔄 Conversion Metrics</h2>
      <div class="conversion-metrics">
        <div class="conversion-item">
          <div class="conversion-label">🎓 → 💼 Student to Professional</div>
          <div class="conversion-rate">${(analytics.conversionRates.studentToProfessional * 100).toFixed(1)}%</div>
        </div>
        <div class="conversion-item">
          <div class="conversion-label">💼 → 🏢 Professional to Enterprise</div>
          <div class="conversion-rate">${(analytics.conversionRates.professionalToEnterprise * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: #f8f9fa; border-radius: 8px;">
      <p style="color: #666; margin: 0;">Report generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
}

export default generatePricingReportHTML;