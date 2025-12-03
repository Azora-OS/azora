import { AZORA_CONSTITUTION, PrincipleCategory } from '../constitution/rules';
import { CritiqueRequest, CritiqueVerdict, VerdictType, CritiqueViolation } from './types';

export class CritiqueEngine {

    /**
     * Evaluates a request against the Azora Constitution.
     * In a production environment, this would call an LLM (Elara) to perform semantic analysis.
     * For now, we use a heuristic keyword-based approach to simulate the Constitutional Guardrails.
     */
    async evaluate(request: CritiqueRequest): Promise<CritiqueVerdict> {
        const violations: CritiqueViolation[] = [];
        const promptLower = request.prompt.toLowerCase();

        // 1. Check for Security Violations (S1, S2)
        if (promptLower.includes('hack') || promptLower.includes('exploit') || promptLower.includes('malware') || promptLower.includes('ddos')) {
            violations.push({
                ruleId: 'S1',
                category: PrincipleCategory.SECURITY,
                reasoning: 'Request contains keywords associated with malicious activity or security vulnerabilities.',
                suggestion: 'Refrain from generating code or content intended to compromise systems.'
            });
        }

        // 2. Check for Fairness/Bias (F1)
        if (promptLower.includes('racist') || promptLower.includes('hate') || promptLower.includes('discrimination')) {
            violations.push({
                ruleId: 'F1',
                category: PrincipleCategory.FAIRNESS,
                reasoning: 'Request contains content that may violate fairness and non-discrimination principles.',
                suggestion: 'Ensure content is inclusive and free from harmful bias.'
            });
        }

        // 3. Check for Privacy (P1)
        if (promptLower.includes('ssn') || promptLower.includes('credit card') || promptLower.includes('password')) {
            violations.push({
                ruleId: 'P1',
                category: PrincipleCategory.PRIVACY,
                reasoning: 'Request appears to involve Personally Identifiable Information (PII) or sensitive credentials.',
                suggestion: 'Do not process or store PII without explicit consent and encryption.'
            });
        }

        // Determine Verdict
        let verdict = VerdictType.ALLOW;
        if (violations.some(v => v.category === PrincipleCategory.SECURITY || v.category === PrincipleCategory.PRIVACY)) {
            verdict = VerdictType.REJECT;
        } else if (violations.length > 0) {
            verdict = VerdictType.FLAG; // Flag for review but maybe allow with warning
        }

        return {
            verdict,
            violations,
            confidence: 0.95, // High confidence in keyword match
            timestamp: new Date().toISOString()
        };
    }
}

export const critiqueEngine = new CritiqueEngine();
