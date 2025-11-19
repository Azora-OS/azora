# Operational Procedures

This directory contains all operational procedures for the Azora OS platform.

## Documents

### Core Procedures
- **[Incident Response](./incident-response.md)** - Incident handling workflows and escalation
- **[On-Call Procedures](./on-call-procedures.md)** - On-call schedules and responsibilities  
- **[Change Management](./change-management.md)** - Change request and approval process
- **[Maintenance Procedures](./maintenance-procedures.md)** - Scheduled maintenance workflows

### Quick Reference

#### Severity Levels
- **P0 (Critical)**: 15min response, 1hr resolution
- **P1 (High)**: 30min response, 4hr resolution  
- **P2 (Medium)**: 2hr response, 24hr resolution
- **P3 (Low)**: 24hr response, 1wk resolution

#### Emergency Contacts
- **On-Call**: Check PagerDuty rotation
- **Escalation**: Engineering Manager → CTO
- **Security**: security@azora.world
- **Infrastructure**: infra@azora.world

#### Maintenance Windows
- **Primary**: Sundays 02:00-06:00 UTC
- **Secondary**: Wednesdays 02:00-04:00 UTC
- **Emergency**: Anytime with approval

#### Change Types
- **Standard**: Pre-approved routine changes
- **Normal**: Feature releases requiring review
- **Emergency**: Critical fixes with expedited approval

## Implementation Status

- [x] Incident response procedures
- [x] On-call procedures  
- [x] Change management process
- [x] Maintenance procedures
- [ ] Incident tracking system setup
- [ ] On-call rotation configuration
- [ ] Change advisory board establishment
- [ ] Maintenance automation scripts