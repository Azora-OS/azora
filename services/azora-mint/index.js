const express = require('express');
const compression = require('compression');
const completeRoutes = require('./routes-complete');
const { helmetConfig, corsConfig, createRateLimiter, errorHandler } = require('../shared/middleware');

const app = express();

// Security middleware stack
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(express.json());
app.use(createRateLimiter(50)); // Financial service - stricter rate limit

// Use comprehensive routes (includes all wallet, mining, staking, economics endpoints)
app.use(completeRoutes);

// Load verification modules
const unCompliance = require('./un-compliance-integration');
const valuationVerification = require('./valuation-verification');
const institutionalVerification = require('./institutional-verification');

// Initialize modules
(async () => {
  try {
    await unCompliance.initialize();
    await valuationVerification.initialize();
    await institutionalVerification.initialize();

    // Schedule regular verifications
    setInterval(async () => {
      await unCompliance.applyCompliancePremium();
      await valuationVerification.verifyValuation();
      await institutionalVerification.verifyInvestments();
      console.log('Valuation verification completed');
    }, 5 * 60 * 1000); // Run every 5 minutes
  } catch (err) {
    console.error('Verification module initialization error:', err.message);
  }
})();

// Additional verification endpoints
app.get('/api/un-compliance', async (req, res) => {
  try {
    const report = await unCompliance.generateReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/valuation-verification', async (req, res) => {
  try {
    const report = await valuationVerification.verifyValuation();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/valuation-certificate', async (req, res) => {
  try {
    const certificate = await valuationVerification.generateValuationCertificate();
    res.send(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/investment-verification', async (req, res) => {
  try {
    const report = await institutionalVerification.generateReport();
    res.send(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/full-valuation-report', async (req, res) => {
  try {
    const valuationData = await valuationVerification.verifyValuation();
    const complianceData = await unCompliance.generateReport();

    const fullReport = {
      timestamp: new Date().toISOString(),
      valuation: {
        current: valuationData.currentValuation,
        target: valuationData.targetValuation,
        percentage: valuationData.valuationPercentage,
        verified: valuationData.isVerified,
        statement: valuationData.statement
      },
      compliance: {
        status: complianceData.status,
        frameworkCompliance: complianceData.framework,
        valuationImpact: {
          premium: complianceData.adjustedMarketCap - complianceData.marketCap,
          percentage: ((complianceData.adjustedMarketCap / complianceData.marketCap) - 1) * 100
        }
      },
      metrics: {
        tokenPrice: valuationData.verificationDetails.price.current,
        marketCap: valuationData.currentValuation,
        institutionalInvestment: valuationData.verificationDetails.institutionalInvestment.total,
        tradingVolume: valuationData.verificationDetails.liquidity.tradingVolume,
        priceStability: valuationData.verificationDetails.stability.coefficient * 100
      },
      conclusion: valuationData.isVerified
        ? `Azora OS has been verified to be worth $10 million based on market activity, institutional investment, and UN compliance standards.`
        : `Azora OS is currently valued at $${(valuationData.currentValuation / 1000000).toFixed(1)} million and is working toward full $10 million verification.`
    };

    res.json(fullReport);
  } catch (err) {
    console.error('Error generating full valuation report:', err);
    res.status(500).json({ error: 'Failed to generate full valuation report' });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => console.log(`✅ Azora Mint running on port ${PORT}`));
module.exports = app;
