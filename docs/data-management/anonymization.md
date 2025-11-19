# Data Anonymization

## Anonymization Strategies

### Personal Identifiers
```javascript
const anonymizationRules = {
    email: (email) => `user${hashString(email)}@anonymous.com`,
    phone: (phone) => `+1-555-${generateRandomDigits(7)}`,
    name: (name) => `User ${hashString(name).substring(0, 8)}`,
    address: () => 'Anonymous Address',
    ip_address: (ip) => anonymizeIP(ip),
    user_agent: () => 'Anonymous Browser'
};

function hashString(str) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(str).digest('hex');
}

function anonymizeIP(ip) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
}
```

### Financial Data
```javascript
const financialAnonymization = {
    // Keep transaction amounts but remove identifiers
    anonymizeTransaction: (transaction) => ({
        ...transaction,
        user_id: null,
        account_number: 'XXXX-XXXX-XXXX-' + transaction.account_number.slice(-4),
        description: 'Anonymous Transaction',
        metadata: {}
    }),
    
    // Preserve statistical properties
    anonymizeAmount: (amount) => {
        // Add small random noise while preserving range
        const noise = (Math.random() - 0.5) * 0.1 * amount;
        return Math.round((amount + noise) * 100) / 100;
    }
};
```

## Anonymization Service

### Core Service
```javascript
class DataAnonymizationService {
    constructor() {
        this.rules = new Map();
        this.loadAnonymizationRules();
    }
    
    loadAnonymizationRules() {
        // Load rules from configuration
        this.rules.set('users', {
            email: anonymizationRules.email,
            first_name: anonymizationRules.name,
            last_name: anonymizationRules.name,
            phone: anonymizationRules.phone,
            address: anonymizationRules.address
        });
        
        this.rules.set('activity_logs', {
            ip_address: anonymizationRules.ip_address,
            user_agent: anonymizationRules.user_agent
        });
    }
    
    async anonymizeTable(tableName, conditions = {}) {
        const rules = this.rules.get(tableName);
        if (!rules) {
            throw new Error(`No anonymization rules for table: ${tableName}`);
        }
        
        const whereClause = this.buildWhereClause(conditions);
        const records = await pool.query(
            `SELECT * FROM ${tableName} ${whereClause}`
        );
        
        for (const record of records.rows) {
            const anonymized = this.anonymizeRecord(record, rules);
            await this.updateRecord(tableName, record.id, anonymized);
        }
        
        return records.rowCount;
    }
    
    anonymizeRecord(record, rules) {
        const anonymized = { ...record };
        
        Object.entries(rules).forEach(([field, rule]) => {
            if (record[field]) {
                anonymized[field] = rule(record[field]);
            }
        });
        
        return anonymized;
    }
    
    async updateRecord(tableName, id, data) {
        const fields = Object.keys(data).filter(key => key !== 'id');
        const setClause = fields.map((field, index) => 
            `${field} = $${index + 2}`
        ).join(', ');
        
        const values = [id, ...fields.map(field => data[field])];
        
        await pool.query(
            `UPDATE ${tableName} SET ${setClause} WHERE id = $1`,
            values
        );
    }
    
    buildWhereClause(conditions) {
        if (Object.keys(conditions).length === 0) return '';
        
        const clauses = Object.entries(conditions).map(([key, value]) => 
            `${key} = '${value}'`
        );
        
        return `WHERE ${clauses.join(' AND ')}`;
    }
}
```

### Batch Anonymization
```javascript
async function batchAnonymizeUsers(criteria) {
    const service = new DataAnonymizationService();
    
    // Anonymize in batches to avoid memory issues
    const batchSize = 1000;
    let offset = 0;
    let totalProcessed = 0;
    
    while (true) {
        const batch = await pool.query(`
            SELECT id FROM users 
            WHERE ${criteria}
            LIMIT ${batchSize} OFFSET ${offset}
        `);
        
        if (batch.rows.length === 0) break;
        
        for (const user of batch.rows) {
            await service.anonymizeTable('users', { id: user.id });
            await service.anonymizeTable('activity_logs', { user_id: user.id });
        }
        
        totalProcessed += batch.rows.length;
        offset += batchSize;
        
        console.log(`Processed ${totalProcessed} users`);
    }
    
    return totalProcessed;
}
```

## K-Anonymity Implementation

### K-Anonymity Service
```javascript
class KAnonymityService {
    constructor(k = 5) {
        this.k = k; // Minimum group size
    }
    
    async ensureKAnonymity(tableName, quasiIdentifiers) {
        // Group records by quasi-identifiers
        const groups = await this.groupByQuasiIdentifiers(
            tableName, 
            quasiIdentifiers
        );
        
        // Suppress or generalize small groups
        for (const group of groups) {
            if (group.count < this.k) {
                await this.handleSmallGroup(tableName, group);
            }
        }
    }
    
    async groupByQuasiIdentifiers(tableName, fields) {
        const groupBy = fields.join(', ');
        const result = await pool.query(`
            SELECT ${groupBy}, COUNT(*) as count, 
                   ARRAY_AGG(id) as record_ids
            FROM ${tableName}
            GROUP BY ${groupBy}
        `);
        
        return result.rows;
    }
    
    async handleSmallGroup(tableName, group) {
        // Option 1: Suppress records
        await pool.query(
            `DELETE FROM ${tableName} WHERE id = ANY($1)`,
            [group.record_ids]
        );
        
        // Option 2: Generalize data (alternative approach)
        // await this.generalizeGroup(tableName, group);
    }
}
```

## Differential Privacy

### Noise Addition
```javascript
class DifferentialPrivacyService {
    constructor(epsilon = 1.0) {
        this.epsilon = epsilon; // Privacy budget
    }
    
    addLaplaceNoise(value, sensitivity) {
        const scale = sensitivity / this.epsilon;
        const noise = this.sampleLaplace(scale);
        return value + noise;
    }
    
    sampleLaplace(scale) {
        const u = Math.random() - 0.5;
        return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    }
    
    async anonymizeAggregateQuery(query, sensitivity) {
        const result = await pool.query(query);
        const noisyResult = result.rows.map(row => {
            const anonymized = { ...row };
            
            // Add noise to numeric fields
            Object.keys(row).forEach(key => {
                if (typeof row[key] === 'number') {
                    anonymized[key] = this.addLaplaceNoise(row[key], sensitivity);
                }
            });
            
            return anonymized;
        });
        
        return noisyResult;
    }
}
```

## Anonymization Testing

### Effectiveness Testing
```javascript
class AnonymizationTester {
    async testReidentificationRisk(tableName, originalData, anonymizedData) {
        const risks = [];
        
        // Test for unique combinations
        const uniqueCombinations = await this.findUniqueCombinations(
            anonymizedData
        );
        
        risks.push({
            type: 'unique_combinations',
            count: uniqueCombinations.length,
            risk_level: uniqueCombinations.length > 0 ? 'high' : 'low'
        });
        
        // Test for linkage attacks
        const linkageRisk = await this.testLinkageAttack(
            originalData, 
            anonymizedData
        );
        
        risks.push({
            type: 'linkage_attack',
            success_rate: linkageRisk,
            risk_level: linkageRisk > 0.1 ? 'high' : 'low'
        });
        
        return risks;
    }
    
    async findUniqueCombinations(data) {
        const combinations = new Map();
        
        data.forEach(record => {
            const key = `${record.age}_${record.zip}_${record.gender}`;
            combinations.set(key, (combinations.get(key) || 0) + 1);
        });
        
        return Array.from(combinations.entries())
            .filter(([key, count]) => count === 1);
    }
    
    async testLinkageAttack(original, anonymized) {
        let successful = 0;
        const total = Math.min(original.length, 100); // Sample size
        
        for (let i = 0; i < total; i++) {
            const matches = anonymized.filter(anon => 
                this.couldBeMatch(original[i], anon)
            );
            
            if (matches.length === 1) {
                successful++;
            }
        }
        
        return successful / total;
    }
    
    couldBeMatch(original, anonymized) {
        // Simple heuristic - could be enhanced
        return Math.abs(original.age - anonymized.age) <= 2 &&
               original.zip.substring(0, 3) === anonymized.zip.substring(0, 3);
    }
}
```

## Anonymization Policies

### Policy Configuration
```yaml
# anonymization-policies.yaml
policies:
  user_data_retention:
    trigger: "account_deletion"
    delay_days: 30
    tables:
      - users
      - user_profiles
      - activity_logs
    
  research_dataset:
    trigger: "manual"
    k_anonymity: 5
    tables:
      - users
      - transactions
    quasi_identifiers:
      - age
      - zip_code
      - gender
    
  gdpr_compliance:
    trigger: "data_request"
    method: "full_anonymization"
    tables:
      - users
      - activity_logs
```

### Policy Execution
```javascript
async function executeAnonymizationPolicy(policyName, context = {}) {
    const policy = await loadPolicy(policyName);
    const service = new DataAnonymizationService();
    
    for (const table of policy.tables) {
        if (policy.k_anonymity) {
            const kService = new KAnonymityService(policy.k_anonymity);
            await kService.ensureKAnonymity(table, policy.quasi_identifiers);
        } else {
            await service.anonymizeTable(table, context);
        }
    }
    
    // Log policy execution
    await logPolicyExecution(policyName, context);
}
```