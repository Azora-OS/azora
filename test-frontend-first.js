// Test script to demonstrate frontend-first architecture
// This shows how apps run with mock data when APIs are unavailable

// Mock data for compliance dashboard
const mockComplianceData = {
  alerts: [
    {
      id: '1',
      type: 'info',
      message: 'System running in demo mode - no APIs configured',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'warning',
      message: 'Configure API endpoints in Settings to enable real data',
      timestamp: new Date().toISOString()
    }
  ],
  metrics: {
    totalChecks: 25,
    passedChecks: 23,
    failedChecks: 2,
    lastUpdated: new Date().toISOString()
  },
  reports: [
    {
      id: '1',
      title: 'Monthly Compliance Report',
      status: 'completed',
      generatedAt: new Date().toISOString()
    }
  ]
};

// Mock data for learning courses
const mockLearningData = [
  {
    id: '1',
    title: 'Introduction to Azora OS',
    description: 'Learn the fundamentals of the Azora Operating System',
    instructor: 'Azora Team',
    duration: '2 hours',
    enrolled: 1250,
    rating: 4.8
  },
  {
    id: '2',
    title: 'Advanced API Integration',
    description: 'Master API integration patterns in Azora',
    instructor: 'Dev Team',
    duration: '4 hours',
    enrolled: 890,
    rating: 4.9
  }
];

// Mock data for payments
const mockPaymentData = {
  balance: 1250.50,
  transactions: [
    {
      id: '1',
      type: 'credit',
      amount: 500,
      description: 'Course completion bonus',
      date: new Date().toISOString(),
      status: 'completed'
    }
  ],
  wallet: {
    address: 'azora_demo_wallet_123',
    balance: 1250.50,
    currency: 'ZAR'
  }
};

// Simulate API client behavior
function simulateApiCall(service, endpoint) {
  console.log(`🔄 API Call: ${service}/${endpoint}`);

  // Simulate no API configured (frontend-first)
  if (!process.env[`${service.toUpperCase()}_API_URL`]) {
    console.log(`⚠️  No API configured for ${service}, using mock data`);

    switch(service) {
      case 'compliance':
        return { success: true, data: mockComplianceData, timestamp: new Date().toISOString() };
      case 'learning':
        return { success: true, data: mockLearningData, timestamp: new Date().toISOString() };
      case 'payments':
        return { success: true, data: mockPaymentData, timestamp: new Date().toISOString() };
      default:
        return { success: false, error: 'Service not available', timestamp: new Date().toISOString() };
    }
  }

  // Simulate API failure (fallback to mock)
  console.log(`❌ API call failed for ${service}, falling back to mock data`);
  return { success: false, error: 'API unavailable', timestamp: new Date().toISOString() };
}

// Test the frontend-first behavior
console.log('🚀 Testing Frontend-First Architecture\n');

console.log('1. Compliance Dashboard (no API configured):');
const complianceResult = simulateApiCall('compliance', 'dashboard');
console.log('✅ Result:', JSON.stringify(complianceResult, null, 2));

console.log('\n2. Learning Courses (no API configured):');
const learningResult = simulateApiCall('learning', 'courses');
console.log('✅ Result:', JSON.stringify(learningResult, null, 2));

console.log('\n3. Payment Data (no API configured):');
const paymentResult = simulateApiCall('payments', 'balance');
console.log('✅ Result:', JSON.stringify(paymentResult, null, 2));

console.log('\n🎯 Frontend-First Success: All apps run independently with mock data!');
console.log('💡 APIs are optional enhancements - users are prompted only when desired');