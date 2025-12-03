/**
 * AZORA KNOWLEDGE OCEAN
 * 
 * Local knowledge base that reduces external API calls
 * 
 * Features:
 * - School curriculum knowledge (K-12, University, PhD)
 * - System knowledge (Azora platform, features, how-to)
 * - General knowledge base (presidents, capitals, basic facts)
 * - Computation engine (calculator, scientific calculations)
 * - Search capabilities
 * 
 * Benefits:
 * - Instant responses (no API latency)
    examples: string[];
    handler: (input: string) => string | number | null;
}

export interface SearchResult {
    entry: KnowledgeEntry;
    score: number;
    matchType: 'exact' | 'keyword' | 'semantic';
}

class KnowledgeOcean {
    private knowledge: Map<string, KnowledgeEntry> = new Map();
    private computations: Map<string, ComputationCapability> = new Map();
    private searchIndex: Map<string, Set<string>> = new Map();

    constructor() {
        this.initializeCurriculum();
        this.initializeGeneralKnowledge();
        this.initializeSystemKnowledge();
        this.initializeComputations();
        this.buildSearchIndex();
    }

    /**
     * Search the knowledge ocean
     */
search(query: string, limit: number = 5): SearchResult[] {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    // 1. Check for exact title match
    for (const entry of this.knowledge.values()) {
        if (entry.title.toLowerCase() === queryLower) {
            results.push({ entry, score: 1.0, matchType: 'exact' });
        }
    }

    // 2. Check for keyword matches
    for (const entry of this.knowledge.values()) {
        let score = 0;

        // Title match
        if (entry.title.toLowerCase().includes(queryLower)) {
            score += 0.8;
        }

        // Keyword matches
        const matchedKeywords = entry.keywords.filter(k =>
            queryWords.some(w => k.toLowerCase().includes(w))
        );
        score += matchedKeywords.length * 0.2;

        // Content match
        if (entry.content.toLowerCase().includes(queryLower)) {
            score += 0.3;
        }

        if (score > 0 && !results.find(r => r.entry.id === entry.id)) {
            results.push({ entry, score, matchType: 'keyword' });
        }
    }

    // Sort by score and limit
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Try to answer query using knowledge ocean
 * Returns null if not found (should use external AI)
 */
tryAnswer(query: string, agent: string = 'ELARA'): string | null {
    const queryLower = query.toLowerCase();

    // 1. Check if it's a computation request
    const computation = this.tryCompute(query);
    if (computation !== null) {
        return computation;
    }

    // 2. Search knowledge base
    const results = this.search(query, 1);

    if (results.length > 0 && results[0].score > 0.5) {
        const entry = results[0].entry;

        // Format response
        let response = entry.content;

        if (entry.examples && entry.examples.length > 0) {
            response += '\n\n**Examples:**\n' + entry.examples.join('\n');
        }

        if (entry.relatedTopics && entry.relatedTopics.length > 0) {
            response += '\n\n**Related Topics:** ' + entry.relatedTopics.join(', ');
        }

        response += '\n\n*Source: Azora Knowledge Ocean (local)*';

        return response;
    }

    return null; // Not found, use external AI
}

/**
 * Try to compute mathematical/scientific calculations
 */
tryCompute(query: string): string | null {
    const queryLower = query.toLowerCase();

    // Check each computation capability
    for (const [name, capability] of this.computations.entries()) {
        try {
            const result = capability.handler(query);
            if (result !== null) {
                return `**Calculation Result:** ${result}\n\n*Computed locally by Azora Knowledge Ocean*`;
            }
        } catch (error) {
            // Continue to next computation type
        }
    }

    return null;
}

/**
 * Add knowledge entry
 */
addKnowledge(entry: KnowledgeEntry): void {
    this.knowledge.set(entry.id, entry);
    this.indexEntry(entry);
}

/**
 * Get knowledge by ID
 */
getKnowledge(id: string): KnowledgeEntry | undefined {
    return this.knowledge.get(id);
}

/**
 * Get all knowledge in category
 */
getByCategory(category: string): KnowledgeEntry[] {
    return Array.from(this.knowledge.values())
        .filter(e => e.category === category);
}

/**
 * Get curriculum knowledge by level and subject
 */
getCurriculum(level: string, subject ?: string): KnowledgeEntry[] {
    return Array.from(this.knowledge.values())
        .filter(e =>
            e.category === 'curriculum' &&
            e.level === level &&
            (!subject || e.subject === subject)
        );
}

    /**
     * Initialize curriculum knowledge
     */
    private initializeCurriculum(): void {
    // Mathematics - Elementary
    this.addKnowledge({
        id: 'math-elem-addition',
        category: 'curriculum',
        subject: 'mathematics',
        level: 'elementary',
        title: 'Addition',
        content: 'Addition is combining two or more numbers to get a total. The numbers being added are called addends, and the result is called the sum.',
        keywords: ['addition', 'add', 'plus', 'sum', 'total', 'combine'],
        examples: [
            '5 + 3 = 8 (5 and 3 are addends, 8 is the sum)',
            '12 + 7 = 19',
            '100 + 250 = 350'
        ],
        relatedTopics: ['Subtraction', 'Multiplication', 'Number Sense'],
        lastUpdated: '2025-11-25',
    });

    this.addKnowledge({
        id: 'math-elem-subtraction',
        category: 'curriculum',
        subject: 'mathematics',
        level: 'elementary',
        title: 'Subtraction',
        content: 'Subtraction is taking away one number from another. The number you start with is the minuend, the number you subtract is the subtrahend, and the result is the difference.',
        keywords: ['subtraction', 'subtract', 'minus', 'difference', 'take away'],
        examples: [
            '10 - 3 = 7 (10 is minuend, 3 is subtrahend, 7 is difference)',
            '25 - 12 = 13',
            '100 - 45 = 55'
        ],
        relatedTopics: ['Addition', 'Division', 'Number Sense'],
        lastUpdated: '2025-11-25',
    });

    this.addKnowledge({
        id: 'science-elem-photosynthesis',
        category: 'curriculum',
        subject: 'science',
        level: 'elementary',
        title: 'Photosynthesis',
        content: 'Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide. They produce glucose (sugar) and oxygen. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂',
        keywords: ['photosynthesis', 'plants', 'sunlight', 'chlorophyll', 'oxygen', 'glucose'],
        examples: [
            'Plants use chlorophyll (green pigment) to capture sunlight',
            'Trees produce oxygen that we breathe',
            'Leaves are the main site of photosynthesis'
        ],
        relatedTopics: ['Plant Biology', 'Cellular Respiration', 'Ecosystems'],
        lastUpdated: '2025-11-25',
    });
}

    /**
     * Initialize general knowledge (presidents, capitals, basic facts)
     */
    private initializeGeneralKnowledge(): void {
    // World Leaders
    this.addKnowledge({
        id: 'general-us-president',
        category: 'general',
        title: 'President of the United States',
        content: 'As of 2025, Joe Biden is the President of the United States (46th president). He took office on January 20, 2021. Note: For current information beyond 2025, use web search.',
        keywords: ['president', 'usa', 'united states', 'joe biden', 'potus', 'who is president'],
        examples: ['Joe Biden is the 46th President'],
        relatedTopics: ['US Government', 'Politics', 'Elections'],
        lastUpdated: '2025-01-20',
    });

    // World Capitals
    this.addKnowledge({
        id: 'general-capitals',
        category: 'general',
        title: 'World Capitals',
        content: 'Major world capitals: USA - Washington D.C., UK - London, France - Paris, Germany - Berlin, Japan - Tokyo, China - Beijing, India - New Delhi, South Africa - Pretoria (executive), Russia - Moscow, Brazil - Brasília, Australia - Canberra, Canada - Ottawa.',
        keywords: ['capital', 'capitals', 'city', 'country', 'washington', 'london', 'paris', 'tokyo'],
        examples: ['The capital of France is Paris', 'Washington D.C. is the capital of the USA'],
        relatedTopics: ['Geography', 'Countries', 'Cities'],
        lastUpdated: '2025-11-25',
    });

    // Basic Science Facts
    this.addKnowledge({
        id: 'general-speed-of-light',
        category: 'general',
        title: 'Speed of Light',
        content: 'The speed of light in vacuum is approximately 299,792,458 meters per second (about 300,000 km/s or 186,000 miles/s). This is denoted by the constant c and is the maximum speed at which all energy, matter, and information in the universe can travel.',
        keywords: ['speed of light', 'light speed', 'c', 'physics', 'constant'],
        examples: ['Light travels at 299,792,458 m/s', 'Nothing can travel faster than light'],
        relatedTopics: ['Physics', 'Relativity', 'Constants'],
        lastUpdated: '2025-11-25',
    });
}

    /**
     * Initialize system knowledge (Azora platform)
     */
    private initializeSystemKnowledge(): void {
    this.addKnowledge({
        id: 'system-token-economy',
        category: 'system',
        title: 'Azora Token Economy',
        content: 'Azora uses a dual-token system: $LEARN (education currency) and $AZR (ecosystem currency). Students earn $LEARN tokens by completing courses and performing well. Tokens can be staked for premium tiers (Bronze, Silver, Gold, Platinum) which provide multipliers up to 5x.',
        keywords: ['tokens', 'learn', 'azr', 'staking', 'mining', 'rewards', 'premium', 'tiers'],
        examples: [
            'Complete a course with 80% score → Earn 80 $LEARN tokens',
            'Stake 500 $LEARN → Unlock Silver tier (2x multiplier)'
        ],
        relatedTopics: ['Staking', 'Premium Tiers', 'Mining Rewards'],
        lastUpdated: '2025-11-25',
    });

    this.addKnowledge({
        id: 'system-ai-agents',
        category: 'system',
        title: 'Azora AI Agents',
        content: 'Azora has 9 specialized AI agents: ELARA (general), KOFI (math), ZURI (science), SANKOFA (code), IMANI (design), NIA (data science), AMARA (simulations), JABARI (business), THABO (DevOps). Each agent has domain expertise and helps with specific tasks.',
        keywords: ['ai', 'agents', 'elara', 'kofi', 'zuri', 'sankofa', 'imani', 'nia', 'amara', 'jabari', 'thabo'],
        examples: [
            'Ask KOFI for help with math homework',
            'Ask SANKOFA to review your code',
            'Ask ZURI to explain a science concept'
        ],
        relatedTopics: ['AI Family', 'Tutoring', 'Learning Support'],
        lastUpdated: '2025-11-25',
    });
}

    /**
     * Initialize computation capabilities
     */
    private initializeComputations(): void {
    // Basic arithmetic
    this.computations.set('arithmetic', {
        name: 'Basic Arithmetic',
        description: 'Addition, subtraction, multiplication, division',
        examples: ['5 + 3', '10 - 4', '6 × 7', '20 / 4'],
        handler: (input: string) => {
            const match = input.match(/(-?\d+\.?\d*)\s*([\+\-\*\/×÷])\s*(-?\d+\.?\d*)/);
            if (!match) return null;

            const [_, a, op, b] = match;
            const num1 = parseFloat(a);
            const num2 = parseFloat(b);

            switch (op) {
                case '+': return num1 + num2;
                case '-': return num1 - num2;
                case '*':
                case '×': return num1 * num2;
                case '/':
                case '÷': return num2 !== 0 ? num1 / num2 : 'Error: Division by zero';
                default: return null;
            }
        },
    });

    // Percentage calculations
    this.computations.set('percentage', {
        name: 'Percentage Calculations',
        description: 'Calculate percentages',
        examples: ['20% of 100', '50 is what percent of 200'],
        handler: (input: string) => {
            const percentOf = input.match(/(\d+)%\s*of\s*(\d+)/i);
            if (percentOf) {
                const [_, percent, number] = percentOf;
                return (parseFloat(percent) / 100) * parseFloat(number);
            }

            const whatPercent = input.match(/(\d+)\s*is\s*what\s*percent\s*of\s*(\d+)/i);
            if (whatPercent) {
                const [_, part, whole] = whatPercent;
                return `${((parseFloat(part) / parseFloat(whole)) * 100).toFixed(2)}%`;
            }

            return null;
        },
    });
}

    /**
     * Build search index for fast lookups
     */
    private buildSearchIndex(): void {
    for(const entry of this.knowledge.values()) {
    this.indexEntry(entry);
}
    }

    /**
     * Index a single entry
     */
    private indexEntry(entry: KnowledgeEntry): void {
    // Index by keywords
    for(const keyword of entry.keywords) {
    const keywordLower = keyword.toLowerCase();
    if (!this.searchIndex.has(keywordLower)) {
        this.searchIndex.set(keywordLower, new Set());
    }
    this.searchIndex.get(keywordLower)!.add(entry.id);
}

// Index by title words
const titleWords = entry.title.toLowerCase().split(/\s+/);
for (const word of titleWords) {
    if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
    }
    this.searchIndex.get(word)!.add(entry.id);
}
    }

/**
 * Get statistics
 */
getStats() {
    const stats = {
        totalEntries: this.knowledge.size,
        byCategory: {} as Record<string, number>,
        byLevel: {} as Record<string, number>,
        bySubject: {} as Record<string, number>,
        computations: this.computations.size,
        predictions: this.predictions.size,
    };

    for (const entry of this.knowledge.values()) {
        stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
        if (entry.level) {
            stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
        }
        if (entry.subject) {
            stats.bySubject[entry.subject] = (stats.bySubject[entry.subject] || 0) + 1;
        }
    }

    return stats;
}

    // PrPEng Extensions
    private predictions: Map<string, PredictedKnowledgeEntry> = new Map();

/**
 * Add a predicted knowledge entry
 */
addPrediction(entry: PredictedKnowledgeEntry): void {
    this.predictions.set(entry.id, entry);
    // Also index it for search
    this.indexEntry(entry);
}

/**
 * Get a predicted entry by ID
 */
getPrediction(id: string): PredictedKnowledgeEntry | undefined {
    return this.predictions.get(id);
}

/**
 * Promote a predicted entry to permanent knowledge
 */
promoteToPermanent(id: string): void {
    const prediction = this.predictions.get(id);
    if(prediction) {
        const permanentEntry: KnowledgeEntry = {
            ...prediction,
            category: prediction.category || 'general', // Ensure category exists
            lastUpdated: new Date().toISOString()
        };

        // Remove from predictions and add to main knowledge
        this.predictions.delete(id);
        this.addKnowledge(permanentEntry);
    }
}
}

export interface PredictedKnowledgeEntry extends KnowledgeEntry {
    source: 'static' | 'prpeng' | 'retention';
    predictedFor?: string;
    confidence?: number;
    frequency: number;
    ttl?: Date;
    promotedAt?: Date;
    conversationId?: string;
}

/**
 * Create knowledge ocean instance
 */
export function createKnowledgeOcean(): KnowledgeOcean {
    return new KnowledgeOcean();
}

/**
 * Default knowledge ocean instance
 */
export const knowledgeOcean = createKnowledgeOcean();

export default knowledgeOcean;
