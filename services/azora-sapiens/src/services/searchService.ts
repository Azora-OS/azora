import axios from 'axios';

interface SearchResult {
    title: string;
    description: string;
    url: string;
}

interface SearchResponse {
    success: boolean;
    query: string;
    results: SearchResult[];
    summary?: string;
}

class SearchService {
    private cache: Map<string, { results: SearchResult[], timestamp: number }>;
    private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour
    private readonly BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY || '';
    private readonly BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

    constructor() {
        this.cache = new Map();
    }

    /**
     * Perform a web search using Brave Search API
     */
    async search(query: string, maxResults: number = 5): Promise<SearchResponse> {
        try {
            // Check cache first
            const cached = this.getFromCache(query);
            if (cached) {
                console.log(`[SearchService] Cache hit for: "${query}"`);
                return {
                    success: true,
                    query,
                    results: cached.slice(0, maxResults),
                    summary: this.summarizeResults(cached.slice(0, maxResults))
                };
            }

            // If no API key, return fallback
            if (!this.BRAVE_API_KEY) {
                console.warn('[SearchService] No BRAVE_SEARCH_API_KEY found. Using fallback.');
                return this.getFallbackResponse(query);
            }

            // Make API request
            const response = await axios.get(this.BRAVE_API_URL, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': this.BRAVE_API_KEY
                },
                params: {
                    q: query,
                    count: maxResults,
                    search_lang: 'en',
                    safesearch: 'moderate'
                },
                timeout: 5000
            });

            const results = this.parseResults(response.data);

            // Cache results
            this.addToCache(query, results);

            return {
                success: true,
                query,
                results: results.slice(0, maxResults),
                summary: this.summarizeResults(results.slice(0, maxResults))
            };

        } catch (error) {
            console.error('[SearchService] Error:', error);
            return {
                success: false,
                query,
                results: [],
                summary: 'I encountered an error while searching the web. Please try again.'
            };
        }
    }

    /**
     * Parse Brave Search API response
     */
    private parseResults(data: any): SearchResult[] {
        if (!data.web?.results) return [];

        return data.web.results.map((result: any) => ({
            title: result.title || 'No title',
            description: result.description || result.snippet || 'No description available',
            url: result.url || ''
        }));
    }

    /**
     * Summarize search results into a concise answer
     */
    private summarizeResults(results: SearchResult[]): string {
        if (results.length === 0) {
            return 'I couldn\'t find any relevant information on the web for that query.';
        }

        const topResult = results[0];
        let summary = `🔍 **Web Search Results:**\n\n`;
        summary += `**${topResult.title}**\n${topResult.description}\n\n`;

        if (results.length > 1) {
            summary += `**Related sources:**\n`;
            results.slice(1, 3).forEach((result, idx) => {
                summary += `${idx + 2}. ${result.title}\n`;
            });
        }

        return summary;
    }

    /**
     * Get cached results
     */
    private getFromCache(query: string): SearchResult[] | null {
        const cached = this.cache.get(query.toLowerCase());
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        if (age > this.CACHE_TTL) {
            this.cache.delete(query.toLowerCase());
            return null;
        }

        return cached.results;
    }

    /**
     * Add results to cache
     */
    private addToCache(query: string, results: SearchResult[]): void {
        this.cache.set(query.toLowerCase(), {
            results,
            timestamp: Date.now()
        });
    }

    /**
     * Fallback response when API key is not available
     */
    private getFallbackResponse(query: string): SearchResponse {
        return {
            success: true,
            query,
            results: [],
            summary: `I don't have access to web search at the moment (missing API key), but I can help you with the course content and your code. Try asking about Python, finance, or the code in your editor!`
        };
    }

    /**
     * Determine if a query should use web search
     */
    shouldUseWebSearch(query: string): boolean {
        const lowerQuery = query.toLowerCase();

        // Keywords that suggest web search is needed
        const webSearchKeywords = [
            'latest', 'recent', 'news', 'current', 'today',
            'what is', 'who is', 'when did', 'how to',
            'search for', 'find', 'look up'
        ];

        // Keywords that suggest local knowledge is sufficient
        const localKeywords = [
            'code', 'function', 'error', 'debug', 'explain',
            'pandas', 'numpy', 'python', 'moving average',
            'order book', 'market data'
        ];

        // Check if query contains web search keywords
        const hasWebKeyword = webSearchKeywords.some(keyword => lowerQuery.includes(keyword));
        const hasLocalKeyword = localKeywords.some(keyword => lowerQuery.includes(keyword));

        // Prefer local knowledge if both are present
        if (hasLocalKeyword) return false;

        return hasWebKeyword;
    }
}

export default new SearchService();
