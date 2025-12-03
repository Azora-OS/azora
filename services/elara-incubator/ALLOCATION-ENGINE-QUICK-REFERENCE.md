# Revenue Allocation Engine - Quick Reference

## Overview
The revenue allocation engine automatically splits revenue 90% to business owner and 10% to Citadel Fund, with comprehensive audit logging and validation.

## Quick Start

### Create an Allocation
```typescript
import { allocationService } from './services/allocation.service.js';

const allocation = await allocationService.createAllocation(
  transactionId,      // Unique transaction ID
  1000,              // Amount in USD
  90,                // Business owner percentage
  10,                // Citadel Fund percentage
  userId,            // User performing action
  ipAddress,         // IP address for audit trail
  businessId         // Business ID for tracking
);

// Result:
// {
//   id: "uuid",
//   transactionId: "tx_123",
//   businessOwnerAmount: 900,
//   citadelFundAmount: 100,
//   allocatedAt: Date
// }
```

### Get Allocation by Transaction
```typescript
const allocation = await allocationService.getAllocationByTransaction(transactionId);
```

### Get All Allocations for a Business
```typescript
const allocations = await allocationService.getBusinessAllocations(businessId);
```

### Calculate Total Allocations
```typescript
const totals = await allocationService.calculateTotalAllocations(businessId);
// {
//   totalRevenue: 3500,
//   businessOwnerTotal: 3150,
//   citadelFundTotal: 350,
//   allocationCount: 3
// }
```

### Get Allocation Statistics
```typescript
const stats = await allocationService.getAllocationStats(businessId);
// {
//   totalAllocations: 3,
//   averageAllocation: 1166.67,
//   largestAllocation: 2000,
//   smallestAllocation: 500,
//   totalBusinessOwnerAmount: 2700,
//   totalCitadelFundAmount: 300,
//   averageBusinessShare: 90,
//   averageFundShare: 10
// }
```

### Get Allocation Breakdown by Period
```typescript
const breakdown = await allocationService.getAllocationBreakdown(
  businessId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
// {
//   period: { startDate, endDate },
//   totalRevenue: 50000,
//   businessOwnerShare: 45000,
//   citadelFundShare: 5000,
//   businessOwnerPercentage: 90,
//   citadelFundPercentage: 10,
//   allocationCount: 25
// }
```

### Update Allocation Rule
```typescript
const rule = await allocationService.updateAllocationRule(
  businessId,
  85,        // New business owner percentage
  15,        // New Citadel Fund percentage
  userId,
  ipAddress
);
```

### Recalculate Allocations
```typescript
const result = await allocationService.recalculateAllocations(
  businessId,
  80,        // New business owner percentage
  20,        // New Citadel Fund percentage
  userId,
  ipAddress
);
// {
//   recalculated: 5,
//   totalNewBusinessOwnerAmount: 4000,
//   totalNewCitadelFundAmount: 1000
// }
```

## Audit Logging

### Get Allocation Audit Trail
```typescript
const auditTrail = await allocationService.getAllocationAuditTrail(allocationId);
// [
//   {
//     timestamp: Date,
//     action: 'allocation_created',
//     details: 'Created allocation for transaction...',
//     userId: 'user_123',
//     ipAddress: '192.168.1.1'
//   }
// ]
```

### Export Audit Trail as CSV
```typescript
const csv = await allocationService.exportAllocationAuditTrailAsCSV(allocationId);
// CSV format with headers: Timestamp, Action, Details, User ID, IP Address
```

### Get All Audit Trails
```typescript
const allTrails = await allocationService.getAllAllocationAuditTrails();
// {
//   'allocation_id_1': [...],
//   'allocation_id_2': [...]
// }
```

## Validation

### Validate Allocation Amounts
```typescript
const validation = allocationService.validateAllocation(
  1000,      // Total amount
  900,       // Business owner amount
  100        // Citadel Fund amount
);
// {
//   valid: true,
//   errors: []
// }
```

## Key Calculations

### 90/10 Split
```
Business Owner Amount = Transaction Amount × 0.90
Citadel Fund Amount = Transaction Amount × 0.10
```

### Custom Split
```
Business Owner Amount = Transaction Amount × (businessShare / 100)
Citadel Fund Amount = Transaction Amount × (fundShare / 100)
```

## Error Handling

### Common Errors
```typescript
// Shares don't add up to 100%
AppError(400, 'Business share and fund share must add up to 100%')

// Negative or zero amount
AppError(400, 'Amount must be positive')

// Invalid share percentages
AppError(400, 'Shares must be between 0 and 100')
```

## Best Practices

1. **Always provide businessId** when creating allocations for accurate tracking
2. **Include userId and ipAddress** for complete audit trails
3. **Use unique transaction IDs** to prevent duplicate allocations
4. **Validate amounts** before creating allocations
5. **Export audit trails regularly** for compliance
6. **Monitor allocation statistics** for business health

## Integration Examples

### With Revenue Service
```typescript
// Revenue service automatically creates allocation
const transaction = await revenueService.recordTransaction(businessId, {
  amount: 1000,
  source: 'Direct Sales'
});
// Allocation is automatically created with 90/10 split
```

### With Fund Service
```typescript
// Get Citadel Fund amount from allocation
const allocation = await allocationService.getAllocationByTransaction(txId);
const fundAmount = allocation.citadelFundAmount;

// Update fund balance
await fundService.addContribution(fundAmount);
```

### With Payment Service
```typescript
// Get business owner amount for payment
const allocation = await allocationService.getAllocationByTransaction(txId);
const paymentAmount = allocation.businessOwnerAmount;

// Process payment
await paymentService.createPayment(businessId, paymentAmount);
```

## Performance Considerations

- Allocations are stored in memory (mock database)
- For production, implement database indexing on businessId and transactionId
- Consider caching allocation statistics for frequently accessed businesses
- Batch recalculations for multiple businesses to improve performance

## Compliance

- All actions are logged with timestamp, user, and IP address
- Audit trails are immutable and exportable
- Supports compliance reporting and audits
- Maintains complete transaction history
