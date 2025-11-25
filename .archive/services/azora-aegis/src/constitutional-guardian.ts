/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

interface ConstitutionalRule {
  id: string;
  principle: string;
  validator: (context: any) => boolean;
  violation: string;
}

export class ConstitutionalGuardian {
  private rules: ConstitutionalRule[] = [
    {
      id: 'UBUNTU_CONSENT',
      principle: 'User consent required for data processing',
      validator: (ctx) => ctx.userConsent === true,
      violation: 'Data processed without user consent'
    },
    {
      id: 'UBUNTU_TRANSPARENCY',
      principle: 'All actions must be transparent and auditable',
      validator: (ctx) => ctx.auditLogged === true,
      violation: 'Action not logged for audit trail'
    },
    {
      id: 'UBUNTU_SOVEREIGNTY',
      principle: 'Users maintain sovereignty over their data',
      validator: (ctx) => ctx.userOwnsData === true,
      violation: 'User data sovereignty violated'
    },
    {
      id: 'UBUNTU_FAIRNESS',
      principle: 'Fair distribution of value and opportunity',
      validator: (ctx) => ctx.fairDistribution === true,
      violation: 'Unfair value distribution detected'
    },
    {
      id: 'UBUNTU_SECURITY',
      principle: 'Security measures protect collective prosperity',
      validator: (ctx) => ctx.encrypted === true && ctx.authenticated === true,
      violation: 'Insufficient security measures'
    },
    {
      id: 'UBUNTU_PRIVACY',
      principle: 'Privacy is a fundamental right',
      validator: (ctx) => ctx.privacyRespected === true,
      violation: 'Privacy violation detected'
    }
  ];

  validateAction(action: string, context: any) {
    const violations: string[] = [];
    const passed: string[] = [];

    this.rules.forEach(rule => {
      if (!rule.validator(context)) {
        violations.push(`${rule.id}: ${rule.violation}`);
      } else {
        passed.push(rule.id);
      }
    });

    return {
      compliant: violations.length === 0,
      violations,
      passed,
      score: (passed.length / this.rules.length) * 100,
      action
    };
  }

  enforceConstitution(action: string, context: any) {
    const validation = this.validateAction(action, context);
    
    if (!validation.compliant) {
      return {
        allowed: false,
        reason: 'Constitutional violation',
        violations: validation.violations,
        remediation: this.getRemediation(validation.violations)
      };
    }

    return {
      allowed: true,
      message: 'Action complies with Ubuntu Constitution',
      score: validation.score
    };
  }

  private getRemediation(violations: string[]) {
    const remediation: string[] = [];

    violations.forEach(v => {
      if (v.includes('consent')) {
        remediation.push('Obtain explicit user consent before proceeding');
      }
      if (v.includes('audit')) {
        remediation.push('Enable audit logging for this action');
      }
      if (v.includes('sovereignty')) {
        remediation.push('Ensure user maintains control over their data');
      }
      if (v.includes('security')) {
        remediation.push('Implement encryption and authentication');
      }
      if (v.includes('privacy')) {
        remediation.push('Review and respect privacy requirements');
      }
    });

    return remediation;
  }

  getConstitutionalPrinciples() {
    return this.rules.map(r => ({
      id: r.id,
      principle: r.principle
    }));
  }

  async auditCompliance(actions: Array<{ action: string; context: any }>) {
    const results = actions.map(({ action, context }) => 
      this.validateAction(action, context)
    );

    const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);

    return {
      overallScore: totalScore.toFixed(2),
      totalActions: actions.length,
      compliantActions: results.filter(r => r.compliant).length,
      totalViolations,
      details: results
    };
  }
}

export default new ConstitutionalGuardian();
