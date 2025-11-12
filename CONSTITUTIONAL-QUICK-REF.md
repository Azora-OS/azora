# 🛡️ CONSTITUTIONAL QUICK REFERENCE

**Azora OS Constitution v3.0.0 - Developer Cheat Sheet**

---

## ⚡ QUICK COMMANDS

```bash
# Check constitutional compliance
npm run constitutional:check

# Enforce compliance (with exit code)
npm run constitutional:enforce

# Generate compliance report
npm run constitutional:report

# Start governance service
npm run governance:start

# Full compliance audit
npm run compliance:audit
```

---

## 📋 CRITICAL RULES

### 🚫 NO MOCK PROTOCOL (Article VIII, Section 8.3)
**NEVER ALLOWED**:
- ❌ `mock*` functions
- ❌ `stub*` implementations  
- ❌ `fake*` data
- ❌ `TODO:` comments
- ❌ `FIXME:` comments
- ❌ `placeholder` code
- ❌ `.skip()` tests
- ❌ `dummy` data

**ALWAYS REQUIRED**:
- ✅ Production-ready code only
- ✅ Real implementations
- ✅ Actual data sources
- ✅ Complete features
- ✅ Passing tests

---

## 🔑 KEY PRINCIPLES

### Ubuntu Philosophy (Article I, Section 1.1)
```typescript
// ✅ GOOD: Collective benefit
async function shareKnowledge(content: Content, community: Community) {
  await community.broadcast(content); // Benefits all
  return { individual: +10, collective: +50 }; // Ubuntu multiplier
}

// ❌ BAD: Individual only
function hoardKnowledge(content: Content) {
  return storePrivately(content); // No collective benefit
}
```

### Truth as Currency (Article I, Section 1.2)
```typescript
// ✅ GOOD: Verifiable truth
async function getUserStats(userId: string) {
  const stats = await db.query('SELECT * FROM user_stats WHERE id = ?', [userId]);
  return { data: stats, verified: true, source: 'database' };
}

// ❌ BAD: Fake data
function getUserStats(userId: string) {
  return { score: 100, verified: false }; // Unverifiable
}
```

### Data Protection (Article V, Section 5.2)
```typescript
// ✅ GOOD: Privacy by design
async function collectData(userId: string, consent: ConsentToken) {
  if (!await verifyConsent(consent)) throw new Error('Consent required');
  const data = await db.query('SELECT id, name FROM users WHERE id = ?', [userId]);
  await encrypt(data);
  return data;
}

// ❌ BAD: No privacy
function collectData(userId: string) {
  return db.query('SELECT * FROM users WHERE id = ?', [userId]); // Excessive data
}
```

---

## 📊 COMPLIANCE TARGETS

| Metric | Target | Check |
|--------|--------|-------|
| Constitutional Alignment | 95%+ | `npm run constitutional:check` |
| Truth Score | 90%+ | Automated verification |
| Ubuntu Score | 85%+ | Community metrics |
| Privacy Protection | 100% | Automated checks |
| No Mock Protocol | 100% | Pre-commit hook |

---

## 🚨 VIOLATION SEVERITY

### CRITICAL 🔴
- No Mock Protocol violations
- Data sovereignty breaches
- Truth verification failures

**Action**: Immediate block, mandatory fix

### HIGH 🟠
- Privacy protection gaps
- Ubuntu principle violations
- AI governance issues

**Action**: Fix within 24 hours

### MEDIUM 🟡
- Documentation gaps
- Transparency issues

**Action**: Fix within 1 week

### LOW 🟢
- Minor improvements
- Enhancement suggestions

**Action**: Fix in next sprint

---

## ✅ PR CHECKLIST

Before submitting:
- [ ] No mocks/stubs/fakes
- [ ] User consent implemented
- [ ] Data encrypted
- [ ] Audit trails added
- [ ] Collective benefit considered
- [ ] Transparent logic
- [ ] Privacy by design
- [ ] Tests passing
- [ ] Constitutional check passed

---

## 🛡️ ENFORCEMENT FLOW

```
Code Written
    ↓
Git Commit
    ↓
Pre-Commit Hook (Constitutional Check)
    ↓
✅ Pass → Commit Proceeds
❌ Fail → Commit Blocked
    ↓
Fix Violations
    ↓
Retry Commit
```

---

## 📞 QUICK HELP

- **Constitution**: [docs/AZORA-CONSTITUTION.md](./docs/AZORA-CONSTITUTION.md)
- **Compliance**: [CONSTITUTIONAL-COMPLIANCE.md](./CONSTITUTIONAL-COMPLIANCE.md)
- **Questions**: constitution@azora.world
- **Violations**: compliance@azora.world

---

## 🎯 REMEMBER

**"Ngiyakwazi ngoba sikwazi"** - "I can because we are"

Every line of code must:
1. Serve collective benefit (Ubuntu)
2. Be truthful and verifiable (Truth)
3. Protect user sovereignty (Privacy)
4. Be production-ready (No Mocks)
5. Create positive impact (PIVC)

---

<div align="center">

**🛡️ Constitutional AI Operating System**

**100% Compliant • 100% Production-Ready • 100% Ubuntu**

</div>
