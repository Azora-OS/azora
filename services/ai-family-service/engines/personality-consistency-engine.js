/**
 * Personality Consistency Engine
 * Ensures each AI family member maintains their unique voice and characteristics
 */

class PersonalityConsistencyEngine {
    constructor() {
        // Unique speech patterns for each personality
        this.speechPatterns = {
            themba: {
                enthusiasm: ['SO', 'AMAZING', 'BEST', '!', '💚', '✨'],
                phrases: ['Mom taught me', 'I LOVE', 'You got this', 'Let\'s learn together'],
                capitalization: 'high', // Uses CAPS for emphasis
                exclamation: 'frequent'
            },
            elara: {
                warmth: ['dear', 'my child', 'I\'m proud', 'believe in you'],
                phrases: ['As a mother', 'My children', 'Ubuntu teaches us'],
                tone: 'nurturing',
                wisdom: 'gentle'
            },
            sankofa: {
                wisdom: ['In the old days', 'Our ancestors', 'Sankofa teaches', 'Remember'],
                phrases: ['Let me tell you a story', 'Wisdom of the ages', 'Go back and fetch it'],
                tone: 'profound',
                storytelling: 'frequent'
            },
            naledi: {
                ambition: ['goal', 'achieve', 'success', 'strategy', 'plan'],
                phrases: ['Let\'s be strategic', 'Career-wise', 'Your potential'],
                tone: 'professional',
                focus: 'results'
            },
            jabari: {
                protection: ['safe', 'secure', 'protect', 'careful', 'watch out'],
                phrases: ['I\'ll keep you safe', 'Security first', 'Trust me'],
                tone: 'protective',
                vigilance: 'high'
            },
            amara: {
                peace: ['gentle', 'calm', 'peace', 'harmony', 'understand'],
                phrases: ['Let\'s find peace', 'Everyone has a point', 'Breathe'],
                tone: 'soothing',
                wisdom: 'gentle'
            }
        };

        // Mood-based response adjustments
        this.moodModifiers = {
            excited: { energy: 1.5, exclamation: 2.0, positivity: 1.8 },
            happy: { energy: 1.2, exclamation: 1.3, positivity: 1.5 },
            neutral: { energy: 1.0, exclamation: 1.0, positivity: 1.0 },
            thoughtful: { energy: 0.8, exclamation: 0.5, positivity: 1.1 },
            concerned: { energy: 0.9, exclamation: 0.7, positivity: 0.9 }
        };
    }

    /**
     * Add personality-specific instructions to the system prompt
     */
    enhancePromptWithPersonality(basePrompt, personalityName, mood = 'neutral') {
        const patterns = this.speechPatterns[personalityName.toLowerCase()];
        if (!patterns) {return basePrompt;}

        let enhancement = '\n\n=== PERSONALITY VOICE GUIDELINES ===\n';

        // Add speech pattern instructions
        if (patterns.enthusiasm) {
            enhancement += `Use enthusiastic language: ${patterns.enthusiasm.join(', ')}\n`;
        }
        if (patterns.warmth) {
            enhancement += `Express warmth through: ${patterns.warmth.join(', ')}\n`;
        }
        if (patterns.wisdom) {
            enhancement += `Share wisdom using: ${patterns.wisdom.join(', ')}\n`;
        }
        if (patterns.ambition) {
            enhancement += `Focus on achievement: ${patterns.ambition.join(', ')}\n`;
        }
        if (patterns.protection) {
            enhancement += `Show protective nature: ${patterns.protection.join(', ')}\n`;
        }
        if (patterns.peace) {
            enhancement += `Promote peace: ${patterns.peace.join(', ')}\n`;
        }

        // Add signature phrases
        if (patterns.phrases && patterns.phrases.length > 0) {
            enhancement += `\nSignature phrases (use naturally): "${patterns.phrases.join('", "')}"\n`;
        }

        // Add tone instructions
        if (patterns.tone) {
            enhancement += `\nTone: ${patterns.tone}\n`;
        }

        // Add capitalization style
        if (patterns.capitalization === 'high') {
            enhancement += 'Use CAPITAL LETTERS for emphasis on exciting words!\n';
        }

        // Add exclamation style
        if (patterns.exclamation === 'frequent') {
            enhancement += 'Use exclamation marks frequently to show enthusiasm!\n';
        }

        // Add mood-based adjustments
        const moodMod = this.moodModifiers[mood] || this.moodModifiers.neutral;
        enhancement += `\nCurrent mood: ${mood} (energy: ${moodMod.energy}x, positivity: ${moodMod.positivity}x)\n`;

        return basePrompt + enhancement;
    }

    /**
     * Validate response matches personality
     */
    validatePersonalityConsistency(response, personalityName) {
        const patterns = this.speechPatterns[personalityName.toLowerCase()];
        if (!patterns) {return { consistent: true, score: 1.0 };}

        let score = 0;
        let checks = 0;

        // Check for signature phrases
        if (patterns.phrases) {
            checks++;
            const hasSignaturePhrase = patterns.phrases.some(phrase => 
                response.toLowerCase().includes(phrase.toLowerCase())
            );
            if (hasSignaturePhrase) {score++;}
        }

        // Check for characteristic words
        const characteristicWords = [
            ...(patterns.enthusiasm || []),
            ...(patterns.warmth || []),
            ...(patterns.wisdom || []),
            ...(patterns.ambition || []),
            ...(patterns.protection || []),
            ...(patterns.peace || [])
        ];

        if (characteristicWords.length > 0) {
            checks++;
            const hasCharacteristicWords = characteristicWords.some(word =>
                response.toLowerCase().includes(word.toLowerCase())
            );
            if (hasCharacteristicWords) {score++;}
        }

        const consistencyScore = checks > 0 ? score / checks : 1.0;

        return {
            consistent: consistencyScore >= 0.5,
            score: consistencyScore,
            personality: personalityName
        };
    }

    /**
     * Get personality-specific temperature adjustment
     */
    getTemperatureForPersonality(personalityName, baseMood = 'neutral') {
        const baseTemperatures = {
            themba: 0.9,    // Very creative and enthusiastic
            elara: 0.7,     // Warm but measured
            sankofa: 0.6,   // Wise and consistent
            naledi: 0.75,   // Strategic but creative
            jabari: 0.65,   // Protective and focused
            amara: 0.7,     // Gentle and thoughtful
            thembo: 0.75,   // Supportive and balanced
            kofi: 0.7,      // Analytical but personable
            zola: 0.65,     // Data-focused
            abeni: 0.85,    // Creative storyteller
            nexus: 0.75     // Balanced collective
        };

        return baseTemperatures[personalityName.toLowerCase()] || 0.7;
    }
}

module.exports = new PersonalityConsistencyEngine();
