"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeConnector = void 0;
const axios_1 = __importDefault(require("axios"));
class KnowledgeConnector {
    constructor() {
        this.oceanUrl = 'http://localhost:4040';
        this.kbUrl = 'http://localhost:4010';
    }
    async queryKnowledge(question) {
        try {
            // Try AI Knowledge Base first (more advanced)
            const kbResponse = await axios_1.default.post(`${this.kbUrl}/api/kb/query`, {
                query: question,
                includeWeb: false
            }, { timeout: 5000 });
            if (kbResponse.data.success && kbResponse.data.results) {
                return kbResponse.data.results;
            }
        }
        catch (error) {
            console.log('KB unavailable, trying Ocean...');
        }
        // Fallback to Knowledge Ocean
        try {
            const oceanResponse = await axios_1.default.post(`${this.oceanUrl}/api/ask`, {
                question
            }, { timeout: 5000 });
            if (oceanResponse.data.success) {
                return oceanResponse.data.answer;
            }
        }
        catch (error) {
            console.error('Knowledge services unavailable:', error);
        }
        return 'Knowledge services are currently unavailable. Please ensure services are running.';
    }
    async searchKnowledge(query, category) {
        try {
            const response = await axios_1.default.post(`${this.oceanUrl}/api/search`, {
                q: query,
                category,
                limit: 10
            }, { timeout: 5000 });
            return response.data.results || [];
        }
        catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }
    async addKnowledge(content, metadata) {
        try {
            await axios_1.default.post(`${this.kbUrl}/api/kb/add`, {
                content,
                metadata
            }, { timeout: 5000 });
            return true;
        }
        catch (error) {
            console.error('Failed to add knowledge:', error);
            return false;
        }
    }
    async getStats() {
        try {
            const response = await axios_1.default.get(`${this.oceanUrl}/api/stats`, { timeout: 3000 });
            return response.data.stats;
        }
        catch (error) {
            return null;
        }
    }
}
exports.KnowledgeConnector = KnowledgeConnector;
//# sourceMappingURL=knowledge-connector.js.map