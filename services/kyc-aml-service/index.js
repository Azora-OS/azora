const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3015;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'kyc-aml-service', 
    timestamp: new Date().toISOString() 
  });
});

// KYC verification endpoint
app.post('/api/kyc/verify', (req, res) => {
  const { userId, personalInfo, documents } = req.body;
  
  // Simulate KYC verification
  const verificationResult = {
    userId: userId,
    verificationId: `kyc_${Date.now()}`,
    status: ["approved", "pending", "rejected"][Math.floor(Math.random() * 3)],
    riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
    verifiedFields: [
      "identity",
      "address",
      "dateOfBirth",
      "nationality"
    ],
    timestamp: new Date().toISOString()
  };
  
  res.json(verificationResult);
});

// AML screening endpoint
app.post('/api/aml/screen', (req, res) => {
  const { transaction, userId, amount } = req.body;
  
  // Simulate AML screening
  const screeningResult = {
    transactionId: transaction.id,
    userId: userId,
    amount: amount,
    riskScore: Math.random(),
    alerts: Math.random() > 0.9 ? [
      {
        type: "suspicious_activity",
        description: "Unusual transaction pattern detected",
        severity: "medium"
      }
    ] : [],
    compliance: Math.random() > 0.1, // 90% compliance rate
    timestamp: new Date().toISOString()
  };
  
  res.json(screeningResult);
});

// Sanctions check endpoint
app.post('/api/compliance/sanctions-check', (req, res) => {
  const { userId, entities } = req.body;
  
  const sanctionsResult = {
    userId: userId,
    entities: entities,
    matches: Math.random() > 0.95 ? [
      {
        entityId: entities[0],
        sanctionList: "OFAC",
        confidence: Math.random() * 0.3 + 0.7
      }
    ] : [],
    timestamp: new Date().toISOString()
  };
  
  res.json(sanctionsResult);
});

app.listen(PORT, () => {
  console.log(`KYC/AML Service running on port ${PORT}`);
});

module.exports = app;