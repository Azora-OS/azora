const { v4: uuidv4 } = require('uuid');

class AgentLibrarianNetwork {
  constructor() {
    this.agents = new Map();
    this.networks = new Map();
    this.initializeAgents();
  }

  initializeAgents() {
    const agents = [
      {
        id: uuidv4(),
        name: 'Libra Prime',
        specialty: 'General Knowledge',
        description: 'Master librarian overseeing all book networks',
        capabilities: ['search', 'recommend', 'categorize', 'curate', 'network-coordination']
      },
      {
        id: uuidv4(),
        name: 'Scientia',
        specialty: 'Science & Technology',
        description: 'Expert in scientific literature and technical documentation',
        capabilities: ['technical-search', 'research-papers', 'academic-curation']
      },
      {
        id: uuidv4(),
        name: 'Historia',
        specialty: 'History & Culture',
        description: 'Curator of historical texts and cultural archives',
        capabilities: ['historical-analysis', 'cultural-context', 'timeline-mapping']
      },
      {
        id: uuidv4(),
        name: 'Artis',
        specialty: 'Arts & Literature',
        description: 'Guardian of creative works and literary masterpieces',
        capabilities: ['literary-analysis', 'creative-recommendations', 'genre-expertise']
      },
      {
        id: uuidv4(),
        name: 'Medicus',
        specialty: 'Health & Medicine',
        description: 'Specialist in medical literature and health sciences',
        capabilities: ['medical-research', 'health-information', 'clinical-studies']
      },
      {
        id: uuidv4(),
        name: 'Philosophus',
        specialty: 'Philosophy & Social Sciences',
        description: 'Expert in philosophical texts and social theory',
        capabilities: ['philosophical-discourse', 'social-analysis', 'ethical-frameworks']
      }
    ];

    agents.forEach(agent => {
      this.agents.set(agent.id, { ...agent, active: true, createdAt: new Date().toISOString() });
    });

    this.createNetworks();
  }

  createNetworks() {
    const networkConfigs = [
      { name: 'Academic Research Network', category: 'academic', agents: ['Scientia', 'Philosophus'] },
      { name: 'Creative Arts Network', category: 'arts', agents: ['Artis', 'Historia'] },
      { name: 'Professional Development Network', category: 'professional', agents: ['Libra Prime', 'Scientia'] },
      { name: 'Health & Wellness Network', category: 'health', agents: ['Medicus', 'Philosophus'] }
    ];

    networkConfigs.forEach(config => {
      const networkId = uuidv4();
      const agentIds = Array.from(this.agents.values())
        .filter(agent => config.agents.includes(agent.name))
        .map(agent => agent.id);

      this.networks.set(networkId, {
        id: networkId,
        name: config.name,
        category: config.category,
        description: `Specialized network for ${config.category} content`,
        agents: agentIds,
        createdAt: new Date().toISOString()
      });
    });
  }

  getAgentBySpecialty(specialty) {
    return Array.from(this.agents.values()).find(agent => agent.specialty === specialty);
  }

  getNetworkByCategory(category) {
    return Array.from(this.networks.values()).find(network => network.category === category);
  }

  async routeQuery(query, category = null) {
    if (category) {
      const network = this.getNetworkByCategory(category);
      if (network) {
        const agents = network.agents.map(id => this.agents.get(id));
        return { network, agents, coordinator: agents[0] };
      }
    }

    const libraPrime = Array.from(this.agents.values()).find(a => a.name === 'Libra Prime');
    return { coordinator: libraPrime, agents: [libraPrime] };
  }

  async curateBooks(books, specialty = null) {
    const agent = specialty ? this.getAgentBySpecialty(specialty) : 
                  Array.from(this.agents.values()).find(a => a.name === 'Libra Prime');
    
    if (!agent) return books;

    return books.map(book => ({
      ...book,
      curatedBy: agent.name,
      curationReason: `Recommended by ${agent.name} for ${agent.specialty}`,
      agentInsight: this.generateInsight(book, agent)
    }));
  }

  generateInsight(book, agent) {
    const insights = {
      'Libra Prime': `Essential reading in ${book.category}`,
      'Scientia': `Cutting-edge research in ${book.category}`,
      'Historia': `Important historical perspective on ${book.category}`,
      'Artis': `Masterful work in ${book.category}`,
      'Medicus': `Critical medical knowledge in ${book.category}`,
      'Philosophus': `Profound philosophical insights in ${book.category}`
    };
    return insights[agent.name] || `Curated for ${book.category}`;
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  getAllNetworks() {
    return Array.from(this.networks.values()).map(network => ({
      ...network,
      agents: network.agents.map(id => this.agents.get(id))
    }));
  }
}

module.exports = { AgentLibrarianNetwork };
