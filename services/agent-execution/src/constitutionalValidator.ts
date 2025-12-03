import { logger } from './logger';

interface ConstitutionalPrinciple {
  id: string;
  name: string;
  weight: number;
  validator: (task: any) => boolean;
}

const principles: ConstitutionalPrinciple[] = [
  {
    id: 'ubuntu-benefit',
    name: 'Community Benefit First',
    weight: 10,
    validator: (task) => !task.payload?.harmful && !task.payload?.extractive
  },
  {
    id: 'transparency',
    name: 'Transparent Operation',
    weight: 9,
    validator: (task) => !!task.payload?.description
  },
  {
    id: 'privacy',
    name: 'Privacy Protection',
    weight: 10,
    validator: (task) => !task.payload?.collectsPII || task.payload?.hasConsent
  },
  {
    id: 'truth',
    name: 'Truth as Currency',
    weight: 10,
    validator: (task) => !task.payload?.misinformation
  }
];

export class ConstitutionalValidator {
  validate(task: any): { valid: boolean; score: number; violations: string[] } {
    const violations: string[] = [];
    let totalWeight = 0;
    let passedWeight = 0;

    for (const principle of principles) {
      totalWeight += principle.weight;
      try {
        if (principle.validator(task)) {
          passedWeight += principle.weight;
        } else {
          violations.push(principle.name);
        }
      } catch (err) {
        logger.warn({ err, principle: principle.id }, 'Validation error');
        violations.push(principle.name);
      }
    }

    const score = totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0;
    const valid = score >= 70;

    return { valid, score, violations };
  }

  async auditTask(taskId: string, task: any): Promise<void> {
    const result = this.validate(task);
    logger.info({ taskId, ...result }, 'Constitutional audit');
    if (!result.valid) {
      logger.warn({ taskId, violations: result.violations }, 'Constitutional violations detected');
    }
  }
}
