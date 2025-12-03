/**
 * AI Family Integration Tests
 * Tests real AI personalities with GPT-4 integration
 */

const chatEngine = require('../chat-engine');
const relationshipEngine = require('../engines/relationship-engine');
const personalityConsistency = require('../engines/personality-consistency-engine');

describe('AI Family System - Full Integration', () => {
    const testUserId = 'test-user-123';

    describe('Personality Engines', () => {
        test('Themba shows enthusiasm when asked about his mom', async () => {
            const response = await chatEngine.chat(
                'themba',
                "How's your mom?",
                testUserId
            );

            expect(response.message).toBeTruthy();
            expect(response.personality).toBe('themba');
            expect(response.message.toLowerCase()).toMatch(/mom|elara|mother/);
            // Themba should be enthusiastic
            expect(response.message).toMatch(/!|LOVE|BEST|SO|amazing/i);
        }, 30000);

        test('Elara responds warmly about her children', async () => {
            const response = await chatEngine.chat(
                'elara',
                "Tell me about your children",
                testUserId
            );

            expect(response.message).toBeTruthy();
            expect(response.message.toLowerCase()).toMatch(/themba|naledi|jabari|amara/);
            expect(response.message.toLowerCase()).toMatch(/proud|love|children/);
        }, 30000);

        test('Sankofa shares wisdom through stories', async () => {
            const response = await chatEngine.chat(
                'sankofa',
                "Tell me a story about Ubuntu",
                testUserId
            );

            expect(response.message).toBeTruthy();
            expect(response.message.toLowerCase()).toMatch(/story|wisdom|ubuntu|ancestors/);
        }, 30000);
    });

    describe('Relationship Dynamics', () => {
        test('Detects family member mentions', () => {
            const mentions = relationshipEngine.detectFamilyMentions(
                "How is Elara doing? Does Themba like learning?"
            );

            expect(mentions).toContain('elara');
            expect(mentions).toContain('themba');
        });

        test('Enriches context with family relationships', () => {
            const enriched = relationshipEngine.enrichContext(
                'themba',
                "How's your mom doing?",
                {}
            );

            expect(enriched.familyContext).toBeTruthy();
            expect(enriched.familyContext.toLowerCase()).toMatch(/elara|mother/);
        });

        test('Detects emotional tone', () => {
            const supportTone = relationshipEngine.detectEmotionalTone(
                "I'm struggling with this concept, can you help?"
            );
            expect(supportTone).toBe('needs_support');

            const excitedTone = relationshipEngine.detectEmotionalTone(
                "This is amazing! I love learning!"
            );
            expect(excitedTone).toBe('enthusiastic');
        });
    });

    describe('Personality Consistency', () => {
        test('Themba has high temperature for creativity', () => {
            const temp = personalityConsistency.getTemperatureForPersonality('themba');
            expect(temp).toBeGreaterThan(0.8);
        });

        test('Sankofa has lower temperature for wisdom', () => {
            const temp = personalityConsistency.getTemperatureForPersonality('sankofa');
            expect(temp).toBeLessThan(0.7);
        });

        test('Validates personality consistency in responses', () => {
            const thembaResponse = "Mom is AMAZING! She believes in me SO much! 💚";
            const validation = personalityConsistency.validatePersonalityConsistency(
                thembaResponse,
                'themba'
            );

            expect(validation.consistent).toBe(true);
            expect(validation.score).toBeGreaterThan(0.5);
        });
    });

    describe('Multi-Personality Chat', () => {
        test('Multiple family members can respond to same question', async () => {
            const responses = await chatEngine.multiPersonalityChat(
                ['themba', 'elara'],
                "What is Ubuntu?",
                testUserId
            );

            expect(responses).toHaveLength(2);
            expect(responses[0].personality).toBe('themba');
            expect(responses[1].personality).toBe('elara');
            
            // Each should have unique perspective
            expect(responses[0].message).not.toBe(responses[1].message);
        }, 60000);
    });

    describe('Context Awareness', () => {
        test('AI remembers conversation history', async () => {
            // First message
            await chatEngine.chat(
                'elara',
                "My name is Alice",
                testUserId
            );

            // Second message - should remember name
            const response = await chatEngine.chat(
                'elara',
                "What's my name?",
                testUserId
            );

            expect(response.message.toLowerCase()).toMatch(/alice/);
        }, 60000);
    });

    afterAll(() => {
        // Clean up test data
        chatEngine.clearHistory(testUserId);
    });
});

describe('Personality Speech Patterns', () => {
    test('Themba uses enthusiastic language', () => {
        const prompt = personalityConsistency.enhancePromptWithPersonality(
            'Base prompt',
            'themba',
            'excited'
        );

        expect(prompt).toMatch(/enthusiastic|CAPITAL|exclamation/i);
    });

    test('Elara uses nurturing language', () => {
        const prompt = personalityConsistency.enhancePromptWithPersonality(
            'Base prompt',
            'elara',
            'neutral'
        );

        expect(prompt).toMatch(/warmth|nurturing/i);
    });

    test('Sankofa uses wisdom language', () => {
        const prompt = personalityConsistency.enhancePromptWithPersonality(
            'Base prompt',
            'sankofa',
            'thoughtful'
        );

        expect(prompt).toMatch(/wisdom|story|ancestors/i);
    });
});
