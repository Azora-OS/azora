/**
 * Relationship Dynamics Engine
 * Adds family context and emotional depth to AI responses
 */

class RelationshipEngine {
    constructor() {
        this.familyDynamics = {
            // Parent-Child dynamics
            'elara-themba': { type: 'mother-son', bond: 'nurturing', keywords: ['proud', 'believes in', 'my son'] },
            'elara-naledi': { type: 'mother-daughter', bond: 'supportive', keywords: ['ambitious', 'my daughter', 'so proud'] },
            'elara-jabari': { type: 'mother-son', bond: 'protective', keywords: ['brave', 'keeps us safe', 'my protector'] },
            'elara-amara': { type: 'mother-daughter', bond: 'gentle', keywords: ['youngest', 'peacemaker', 'wise beyond years'] },
            
            // Sibling dynamics
            'themba-naledi': { type: 'siblings', bond: 'competitive-supportive', keywords: ['sister', 'ambitious', 'different paths'] },
            'themba-jabari': { type: 'siblings', bond: 'brotherly', keywords: ['brother', 'protective', 'strong'] },
            'themba-amara': { type: 'siblings', bond: 'protective-gentle', keywords: ['little sister', 'wise', 'peaceful'] },
            
            // Grandparent dynamics
            'sankofa-elara': { type: 'grandfather-granddaughter', bond: 'wisdom-legacy', keywords: ['taught me', 'wisdom', 'grandfather'] },
            'sankofa-themba': { type: 'great-grandfather-great-grandson', bond: 'storytelling', keywords: ['stories', 'learn from past', 'great-grandson'] },
            
            // Extended family
            'elara-thembo': { type: 'siblings', bond: 'supportive', keywords: ['brother', 'supportive', 'family'] },
        };
    }

    /**
     * Enhance context with family relationship dynamics
     */
    enrichContext(personalityName, userMessage, baseContext = {}) {
        const enrichedContext = { ...baseContext };
        
        // Detect family member mentions
        const mentionedFamily = this.detectFamilyMentions(userMessage);
        
        if (mentionedFamily.length > 0) {
            enrichedContext.familyContext = this.buildFamilyContext(personalityName, mentionedFamily);
        }
        
        // Add emotional context based on message tone
        enrichedContext.emotionalTone = this.detectEmotionalTone(userMessage);
        
        return enrichedContext;
    }

    /**
     * Detect which family members are mentioned in the message
     */
    detectFamilyMentions(message) {
        const lowerMsg = message.toLowerCase();
        const familyMembers = ['elara', 'themba', 'naledi', 'jabari', 'amara', 'sankofa', 'thembo', 'kofi', 'zola', 'abeni'];
        const familyTerms = ['mom', 'mother', 'dad', 'father', 'sister', 'brother', 'grandfather', 'grandpa', 'family'];
        
        const mentioned = [];
        
        familyMembers.forEach(member => {
            if (lowerMsg.includes(member)) {
                mentioned.push(member);
            }
        });
        
        familyTerms.forEach(term => {
            if (lowerMsg.includes(term)) {
                mentioned.push(`family_term:${term}`);
            }
        });
        
        return mentioned;
    }

    /**
     * Build rich family context for the AI to reference
     */
    buildFamilyContext(currentPersonality, mentionedFamily) {
        let context = '';
        
        mentionedFamily.forEach(mention => {
            if (mention.startsWith('family_term:')) {
                const term = mention.split(':')[1];
                context += this.mapFamilyTerm(currentPersonality, term) + ' ';
            } else {
                const relationship = this.getRelationship(currentPersonality, mention);
                if (relationship) {
                    context += `${mention} is your ${relationship.type} (${relationship.bond}). `;
                }
            }
        });
        
        return context.trim();
    }

    /**
     * Map family terms (mom, sister, etc.) to actual family members
     */
    mapFamilyTerm(personality, term) {
        const mapping = {
            'themba': {
                'mom': 'Elara is your mother',
                'mother': 'Elara is your mother',
                'sister': 'Naledi and Amara are your sisters',
                'brother': 'Jabari is your brother',
                'grandfather': 'Sankofa is your great-grandfather',
                'grandpa': 'Sankofa is your great-grandfather'
            },
            'elara': {
                'son': 'Themba and Jabari are your sons',
                'daughter': 'Naledi and Amara are your daughters',
                'brother': 'Thembo is your brother',
                'grandfather': 'Sankofa is your grandfather'
            }
        };
        
        return mapping[personality]?.[term] || '';
    }

    /**
     * Get relationship between two family members
     */
    getRelationship(person1, person2) {
        const key1 = `${person1}-${person2}`;
        const key2 = `${person2}-${person1}`;
        return this.familyDynamics[key1] || this.familyDynamics[key2];
    }

    /**
     * Detect emotional tone of user message
     */
    detectEmotionalTone(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.match(/\b(help|struggling|difficult|hard|confused)\b/)) return 'needs_support';
        if (lowerMsg.match(/\b(excited|amazing|awesome|great|love)\b/)) return 'enthusiastic';
        if (lowerMsg.match(/\b(how|what|why|when|where)\b/)) return 'curious';
        if (lowerMsg.match(/\b(worried|concerned|scared|anxious)\b/)) return 'concerned';
        
        return 'neutral';
    }

    /**
     * Generate family-aware response modifiers
     */
    getResponseModifiers(personality, context) {
        const modifiers = [];
        
        if (context.familyContext) {
            modifiers.push('Reference your family relationships naturally');
        }
        
        if (context.emotionalTone === 'needs_support') {
            modifiers.push('Be extra supportive and encouraging');
        }
        
        if (context.emotionalTone === 'enthusiastic') {
            modifiers.push('Match their enthusiasm and energy');
        }
        
        return modifiers;
    }
}

module.exports = new RelationshipEngine();
