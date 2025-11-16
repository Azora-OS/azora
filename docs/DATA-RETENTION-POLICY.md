# Data Retention Policy

## Overview

This policy defines how long Azora OS retains user data and when automatic deletion occurs.

## Retention Periods

### User Data
- **User Profiles**: Retained until account deletion
- **Authentication Logs**: 90 days (auto-delete)
- **Session Data**: 30 days (auto-delete)

### Educational Data
- **Course Progress**: 5 years after last activity
- **Certificates**: Permanent (blockchain-verified)
- **Assessment Results**: 5 years

### Financial Data
- **Transaction Records**: 7 years (legal requirement)
- **Wallet Balances**: Active account lifetime
- **Mining History**: 7 years

### System Data
- **Audit Logs**: 7 years (compliance)
- **Error Logs**: 90 days (auto-delete)
- **Performance Metrics**: 30 days (auto-delete)

## Automated Cleanup

Cleanup runs daily at 02:00 UTC:
```typescript
dataRetentionManager.cleanupExpiredData();
```

## Manual Deletion

Users can request immediate deletion via:
- Account settings → Delete Account
- Email: privacy@azora.world
- API: `DELETE /api/users/me`

## Legal Holds

Data under legal hold is exempt from automatic deletion.
