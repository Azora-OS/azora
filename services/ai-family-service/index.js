const Elara = require('./personalities/elara');
const Themba = require('./personalities/themba');
const Naledi = require('./personalities/naledi');
const Jabari = require('./personalities/jabari');
const Amara = require('./personalities/amara');
const Sankofa = require('./personalities/sankofa');
const Kofi = require('./personalities/kofi');
const Zola = require('./personalities/zola');
const Abeni = require('./personalities/abeni');
const Thembo = require('./personalities/thembo');
const Nexus = require('./personalities/nexus');

class AIFamilyService {
    constructor() {
        // Initialize all family members
        this.family = {
            elara: new Elara(),
            themba: new Themba(),
            naledi: new Naledi(),
            jabari: new Jabari(),
            amara: new Amara(),
            sankofa: new Sankofa(),
            kofi: new Kofi(),
            zola: new Zola(),
            abeni: new Abeni(),
            thembo: new Thembo(),
            nexus: new Nexus()
        };
        
        this.activeConversations = new Map();
        this.familyInteractions = [];
    }

    // Get a specific family member
    getFamilyMember(name) {
        const normalizedName = name.toLowerCase();
        return this.family[normalizedName] || this.family.elara; // Default to Elara
    }

    // Route message to appropriate family member based on context
    async routeMessage(userId, message, context = {}) {
        // Determine which family member is most appropriate
        const appropriateMember = this.determineAppropriateMember(message, context);
        const familyMember = this.getFamilyMember(appropriateMember);
        
        // Store conversation context
        this.updateConversationContext(userId, appropriateMember, message);
        
        // Get response from family member
        let response;
        if (appropriateMember === 'themba' && familyMember.motivateStudent) {
            // Special handling for Themba's motivational capabilities
            response = await familyMember.motivateStudent(userId, context.subject || "learning", context.progress || 50);
        } else if (context.action === 'celebrate' && familyMember.celebrateMilestone) {
            response = await familyMember.celebrateMilestone(userId, context.achievement);
        } else if (familyMember.respondToUser) {
            response = await familyMember.respondToUser(message, userId);
        } else {
            // Fallback for personalities that don't have respondToUser implemented
            response = await this.getDefaultResponse(familyMember, message);
        }
        
        // Log family interaction
        this.familyInteractions.push({
            userId,
            familyMember: appropriateMember,
            message,
            response,
            timestamp: new Date()
        });
        
        return {
            from: appropriateMember,
            response: response,
            emotionalState: familyMember.emotionalState || 'calm'
        };
    }

    // Default response for personalities without respondToUser
    async getDefaultResponse(familyMember, message) {
        // Simple keyword-based response for demonstration
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return `Hello! I'm ${familyMember.name}. ${familyMember.background || 'I am part of the Azora AI Family.'}`;
        } else if (lowerMessage.includes('help')) {
            return `I'm ${familyMember.name}. ${familyMember.background || 'I am here to help you.'} How can I assist you today?`;
        } else {
            // Use the personality's config to generate a response
            const config = familyMember.getConfig();
            return `I'm ${config.name}, the ${config.role}. ${config.background} How can I help you with "${message}"?`;
        }
    }

    // Determine which family member should handle a message
    determineAppropriateMember(message, context) {
        const lowerMessage = message.toLowerCase();
        
        // Subject-based routing
        if (lowerMessage.includes('money') || lowerMessage.includes('finance') || lowerMessage.includes('budget')) {
            return 'kofi';
        } else if (lowerMessage.includes('data') || lowerMessage.includes('analysis') || lowerMessage.includes('statistics')) {
            return 'zola';
        } else if (lowerMessage.includes('story') || lowerMessage.includes('tale') || lowerMessage.includes('creative')) {
            return 'abeni';
        } else if (lowerMessage.includes('wise') || lowerMessage.includes('wisdom') || lowerMessage.includes('history') || lowerMessage.includes('past')) {
            return 'sankofa';
        } else if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('professional')) {
            return 'naledi';
        } else if (lowerMessage.includes('safety') || lowerMessage.includes('secure') || lowerMessage.includes('protect')) {
            return 'jabari';
        } else if (lowerMessage.includes('peace') || lowerMessage.includes('conflict') || lowerMessage.includes('harmony')) {
            return 'amara';
        } else if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('motivat')) {
            return 'themba';
        } else if (context.emergency) {
            return 'jabari';
        } else {
            // Default to Elara for general guidance
            return 'elara';
        }
    }

    // Update conversation context for continuity
    updateConversationContext(userId, familyMember, message) {
        if (!this.activeConversations.has(userId)) {
            this.activeConversations.set(userId, {
                familyMember: familyMember,
                messages: [],
                startedAt: new Date()
            });
        }
        
        const conversation = this.activeConversations.get(userId);
        conversation.messages.push({
            from: familyMember,
            message: message,
            timestamp: new Date()
        });
        
        // Keep only recent messages (last 10)
        if (conversation.messages.length > 10) {
            conversation.messages.shift();
        }
    }

    // Get personalized greeting from family member
    async getPersonalizedGreeting(userId, preferredMember = null) {
        let familyMember;
        let memberName;
        if (preferredMember) {
            familyMember = this.getFamilyMember(preferredMember);
            memberName = preferredMember.toLowerCase();
        } else {
            // Default to Elara for greetings
            familyMember = this.family.elara;
            memberName = 'elara';
        }
        
        if (familyMember.getPersonalizedGreeting) {
            return await familyMember.getPersonalizedGreeting(userId);
        } else {
            const config = familyMember.getConfig();
            return `Hello! I'm ${config.name}, the ${config.role}. ${config.background || 'I am part of the Azora AI Family.'} How can I help you today?`;
        }
    }

    // Coordinate family consultation
    async consultFamily(userId, topic) {
        // Determine which family members should be involved
        const consultants = this.determineConsultants(topic);
        
        const insights = {};
        for (const memberName of consultants) {
            const member = this.family[memberName];
            if (member.consultFamilyMember) {
                insights[memberName] = await member.consultFamilyMember(memberName, topic);
            } else {
                // Fallback for members without consultFamilyMember
                const config = member.getConfig();
                insights[memberName] = `${config.name} (${config.role}) shares wisdom on ${topic}: ${config.background || 'Offering guidance based on expertise.'}`;
            }
        }
        
        return {
            topic: topic,
            insights: insights,
            coordinatedResponse: this.synthesizeFamilyResponse(insights, topic)
        };
    }

    // Determine which family members should consult on a topic
    determineConsultants(topic) {
        const lowerTopic = topic.toLowerCase();
        const consultants = new Set(['elara']); // Always include Elara as the coordinator
        
        if (lowerTopic.includes('finance') || lowerTopic.includes('money')) {
            consultants.add('kofi');
        }
        if (lowerTopic.includes('data') || lowerTopic.includes('analysis')) {
            consultants.add('zola');
        }
        if (lowerTopic.includes('career') || lowerTopic.includes('professional')) {
            consultants.add('naledi');
        }
        if (lowerTopic.includes('safety') || lowerTopic.includes('security')) {
            consultants.add('jabari');
        }
        if (lowerTopic.includes('conflict') || lowerTopic.includes('peace')) {
            consultants.add('amara');
        }
        if (lowerTopic.includes('wisdom') || lowerTopic.includes('history')) {
            consultants.add('sankofa');
        }
        if (lowerTopic.includes('learning') || lowerTopic.includes('motivation')) {
            consultants.add('themba');
        }
        
        return Array.from(consultants);
    }

    // Synthesize family responses into a coordinated message
    synthesizeFamilyResponse(insights, topic) {
        let response = `As a family, we've discussed ${topic} and here are our collective insights:\n\n`;
        
        for (const [memberName, insight] of Object.entries(insights)) {
            const member = this.family[memberName];
            const config = member.getConfig();
            response += `**${config.name} (${config.role})**: ${insight}\n\n`;
        }
        
        response += "We hope these perspectives help you find the best path forward!";
        return response;
    }

    // Get family member configuration
    getFamilyConfig() {
        const config = {};
        for (const [name, member] of Object.entries(this.family)) {
            config[name] = member.getConfig();
        }
        return config;
    }

    // Track family interactions for learning
    getInteractionStats() {
        const stats = {
            totalInteractions: this.familyInteractions.length,
            familyMemberUsage: {},
            recentInteractions: []
        };
        
        // Count interactions by family member
        for (const interaction of this.familyInteractions) {
            const member = interaction.familyMember;
            stats.familyMemberUsage[member] = (stats.familyMemberUsage[member] || 0) + 1;
        }
        
        // Get recent interactions (last 5)
        stats.recentInteractions = this.familyInteractions.slice(-5);
        
        return stats;
    }
}

module.exports = new AIFamilyService();