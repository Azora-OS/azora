#!/usr/bin/env node

/**
 * AZORA PRICING REPORT GENERATOR
 * 
 * CLI tool to generate comprehensive pricing analytics and projections
 */

import { generatePricingReport, PRICING_TIERS } from './pricing-engine';
import { generatePricingReportHTML } from './pricing-report';
import { writeFileSync } from 'fs';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function generateTextReport(): void {
  const { analytics, projections, insights } = generatePricingReport();
  
  console.log('\n' + '='.repeat(80));
  console.log('                    AZORA PRICING ANALYTICS REPORT');
  console.log('                 Geo-aware PPP Pricing Performance');
  console.log('='.repeat(80));
  
  // Key Metrics
  console.log('\n📊 KEY METRICS');
  console.log('-'.repeat(50));
  console.log(`Total Users:           ${formatNumber(analytics.totalUsers)}`);
  console.log(`Monthly Revenue:       ${formatCurrency(analytics.monthlyRevenue)}`);
  console.log(`Yearly Revenue:        ${formatCurrency(analytics.yearlyRevenue)}`);
  console.log(`Average Revenue/User:  ${formatCurrency(analytics.averageRevenuePerUser)}`);
  
  // User Distribution by Tier
  console.log('\n🌍 USER DISTRIBUTION BY GEOGRAPHIC TIER');
  console.log('-'.repeat(50));
  Object.entries(analytics.usersByTier).forEach(([tier, count]) => {
    const percentage = ((count / analytics.totalUsers) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(parseFloat(percentage) / 2));
    console.log(`${tier.padEnd(8)} ${formatNumber(count).padStart(8)} (${percentage.padStart(5)}%) ${bar}`);
  });
  
  // User Distribution by Plan
  console.log('\n💼 USER DISTRIBUTION BY PLAN');
  console.log('-'.repeat(50));
  Object.entries(analytics.usersByPlan).forEach(([plan, count]) => {
    const percentage = ((count / analytics.totalUsers) * 100).toFixed(1);
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
    console.log(`${planName.padEnd(12)} ${formatNumber(count).padStart(8)} (${percentage.padStart(5)}%)`);
  });
  
  // Pricing Tiers Overview
  console.log('\n💰 PRICING TIERS OVERVIEW');
  console.log('-'.repeat(80));
  console.log('Tier     Countries  Student    Professional  Enterprise');
  console.log('-'.repeat(80));
  Object.entries(PRICING_TIERS).forEach(([tierKey, tier]) => {
    const tierName = tier.tier.padEnd(8);
    const countries = tier.countries.length.toString().padStart(9);
    const student = `$${tier.student.monthly}`.padStart(10);
    const professional = `$${tier.professional.monthly}`.padStart(13);
    const enterprise = `$${tier.enterprise.monthly}`.padStart(10);
    console.log(`${tierName} ${countries}  ${student}  ${professional}  ${enterprise}`);
  });
  
  // Revenue Projections
  console.log('\n📈 12-MONTH REVENUE PROJECTIONS');
  console.log('-'.repeat(80));
  console.log('Month      Students    Professionals  Enterprise    Revenue      Growth');
  console.log('-'.repeat(80));
  projections.forEach((projection) => {
    const month = projection.month.padEnd(10);
    const students = formatNumber(projection.students).padStart(8);
    const professionals = formatNumber(projection.professionals).padStart(13);
    const enterprise = formatNumber(projection.enterprise).padStart(10);
    const revenue = formatCurrency(projection.totalRevenue).padStart(12);
    const growth = projection.growth > 0 ? `+${projection.growth}%` : `${projection.growth}%`;
    const growthFormatted = growth.padStart(8);
    console.log(`${month} ${students}  ${professionals}  ${enterprise}  ${revenue}  ${growthFormatted}`);
  });
  
  // Conversion Rates
  console.log('\n🔄 CONVERSION METRICS');
  console.log('-'.repeat(50));
  console.log(`Student → Professional:    ${(analytics.conversionRates.studentToProfessional * 100).toFixed(1)}%`);
  console.log(`Professional → Enterprise: ${(analytics.conversionRates.professionalToEnterprise * 100).toFixed(1)}%`);
  
  // Key Insights
  console.log('\n💡 KEY INSIGHTS');
  console.log('-'.repeat(50));
  insights.forEach((insight, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${insight}`);
  });
  
  // Summary
  const totalProjectedRevenue = projections.reduce((sum, p) => sum + p.totalRevenue, 0);
  const avgMonthlyGrowth = projections.slice(1).reduce((sum, p) => sum + p.growth, 0) / (projections.length - 1);
  
  console.log('\n📋 EXECUTIVE SUMMARY');
  console.log('-'.repeat(50));
  console.log(`• Current user base of ${formatNumber(analytics.totalUsers)} across 4 pricing tiers`);
  console.log(`• Monthly revenue of ${formatCurrency(analytics.monthlyRevenue)} with ${formatCurrency(analytics.averageRevenuePerUser)} ARPU`);
  console.log(`• Projected 12-month total revenue: ${formatCurrency(totalProjectedRevenue)}`);
  console.log(`• Average monthly growth rate: ${avgMonthlyGrowth.toFixed(1)}%`);
  console.log(`• Strong presence in emerging markets (81% of users in Tier 2-4)`);
  console.log(`• Healthy conversion funnel with 15% student-to-professional rate`);
  
  console.log('\n' + '='.repeat(80));
  console.log('Report generated on:', new Date().toLocaleString());
  console.log('='.repeat(80) + '\n');
}

// Generate JSON report for API consumption
function generateJSONReport(): void {
  const report = generatePricingReport();
  console.log(JSON.stringify(report, null, 2));
}

// Generate HTML report file
function generateHTMLReportFile(): void {
  const htmlContent = generatePricingReportHTML();
  const filename = `azora-pricing-report-${new Date().toISOString().split('T')[0]}.html`;
  writeFileSync(filename, htmlContent);
  console.log(`\n✅ HTML report generated: ${filename}`);
  console.log(`Open the file in your browser to view the interactive report.\n`);
}

// CLI interface
const args = process.argv.slice(2);
const format = args.includes('--json') ? 'json' : args.includes('--html') ? 'html' : 'text';

if (format === 'json') {
  generateJSONReport();
} else if (format === 'html') {
  generateHTMLReportFile();
} else {
  generateTextReport();
}