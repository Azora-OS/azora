/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

interface ThreatSignature {
  id: string;
  pattern: RegExp;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  mitigation: string;
}

export class ThreatIntelligence {
  private signatures: ThreatSignature[] = [
    {
      id: 'SQL_INJECTION',
      pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER).*FROM/i,
      severity: 'CRITICAL',
      description: 'SQL Injection attempt detected',
      mitigation: 'Use parameterized queries'
    },
    {
      id: 'XSS_ATTACK',
      pattern: /<script[^>]*>.*<\/script>/i,
      severity: 'HIGH',
      description: 'Cross-Site Scripting (XSS) detected',
      mitigation: 'Sanitize user input and encode output'
    },
    {
      id: 'PATH_TRAVERSAL',
      pattern: /\.\.[\/\\]/,
      severity: 'HIGH',
      description: 'Path traversal attack detected',
      mitigation: 'Validate and sanitize file paths'
    },
    {
      id: 'COMMAND_INJECTION',
      pattern: /[;&|`$()]/,
      severity: 'CRITICAL',
      description: 'Command injection attempt',
      mitigation: 'Avoid shell execution, use safe APIs'
    },
    {
      id: 'CREDENTIAL_LEAK',
      pattern: /(password|token|api[_-]?key|secret)[\s:=]["']?[\w\-]{8,}/i,
      severity: 'CRITICAL',
      description: 'Potential credential exposure',
      mitigation: 'Use environment variables and secrets management'
    },
    {
      id: 'WEAK_CRYPTO',
      pattern: /(md5|sha1|des)\s*\(/i,
      severity: 'MEDIUM',
      description: 'Weak cryptographic algorithm',
      mitigation: 'Use SHA-256, bcrypt, or Argon2'
    }
  ];

  detectThreats(input: string) {
    const detected = this.signatures
      .filter(sig => sig.pattern.test(input))
      .map(sig => ({
        id: sig.id,
        severity: sig.severity,
        description: sig.description,
        mitigation: sig.mitigation,
        matched: input.match(sig.pattern)?.[0]
      }));

    return {
      threatsFound: detected.length,
      threats: detected,
      riskScore: this.calculateRiskScore(detected)
    };
  }

  private calculateRiskScore(threats: any[]) {
    const weights = { CRITICAL: 40, HIGH: 25, MEDIUM: 15, LOW: 5 };
    return threats.reduce((score, t) => score + weights[t.severity], 0);
  }

  async analyzePattern(data: string[]) {
    const patterns = new Map<string, number>();
    
    data.forEach(item => {
      this.signatures.forEach(sig => {
        if (sig.pattern.test(item)) {
          patterns.set(sig.id, (patterns.get(sig.id) || 0) + 1);
        }
      });
    });

    return Array.from(patterns.entries())
      .map(([id, count]) => ({ threatId: id, occurrences: count }))
      .sort((a, b) => b.occurrences - a.occurrences);
  }

  getRecommendations(threats: any[]) {
    const recs = new Set<string>();
    
    threats.forEach(t => {
      recs.add(t.mitigation);
      
      if (t.severity === 'CRITICAL') {
        recs.add('Immediate security review required');
        recs.add('Enable advanced monitoring');
      }
    });

    return Array.from(recs);
  }
}

export default new ThreatIntelligence();
