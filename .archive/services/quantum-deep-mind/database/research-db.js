// database/research-db.js
/**
 * Research Database Module
 * Manages research data, findings, and educational content
 */

class ResearchDatabase {
  constructor() {
    this.projects = new Map();
    this.findings = [];
    this.curriculumModules = new Map();
    this.insights = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🗄️ Initializing research database...');

    // Initialize with sample data
    await this.seedDatabase();

    this.initialized = true;
    console.log('✅ Research database initialized');
  }

  async seedDatabase() {
    // Sample research projects
    const sampleProjects = [
      {
        id: 'quantum-001',
        title: 'Quantum-Secure Cryptography',
        description: 'Developing post-quantum cryptographic algorithms for African financial systems',
        category: 'quantum',
        leadResearcher: 'Dr. Sizwe Ngwenya',
        status: 'active',
        createdAt: new Date('2025-10-01')
      },
      {
        id: 'ai-001',
        title: 'Constitutional AI for Education',
        description: 'AI systems that adhere to ethical guidelines in educational content generation',
        category: 'ai',
        leadResearcher: 'Elara Ω',
        status: 'active',
        createdAt: new Date('2025-09-15')
      },
      {
        id: 'blockchain-001',
        title: 'DeFi for Economic Empowerment',
        description: 'Decentralized finance protocols designed for African economic inclusion',
        category: 'blockchain',
        leadResearcher: 'Azora Research Team',
        status: 'completed',
        createdAt: new Date('2025-08-20')
      }
    ];

    sampleProjects.forEach(project => this.projects.set(project.id, project));

    // Sample findings
    this.findings = [
      {
        id: 'finding-001',
        title: 'Quantum Advantage in Optimization',
        category: 'quantum',
        summary: 'Quantum algorithms show 100x speedup for certain optimization problems',
        impact: 'high',
        date: new Date('2025-11-01')
      },
      {
        id: 'finding-002',
        title: 'AI Ethics Framework Success',
        category: 'ai',
        summary: 'Constitutional AI reduces bias by 85% in educational content',
        impact: 'very high',
        date: new Date('2025-10-15')
      }
    ];

    // Sample curriculum modules
    this.curriculumModules.set('quantum', [
      {
        id: 'quantum-basics',
        title: 'Quantum Computing Fundamentals',
        level: 'beginner',
        duration: 45,
        skills: ['quantum bits', 'superposition', 'entanglement']
      },
      {
        id: 'quantum-algorithms',
        title: 'Quantum Algorithms',
        level: 'intermediate',
        duration: 90,
        skills: ['Shor\'s algorithm', 'Grover\'s search', 'quantum Fourier transform']
      }
    ]);

    this.curriculumModules.set('ai', [
      {
        id: 'ai-ethics',
        title: 'AI Ethics and Governance',
        level: 'intermediate',
        duration: 60,
        skills: ['ethical AI design', 'bias mitigation', 'constitutional AI']
      }
    ]);

    this.curriculumModules.set('blockchain', [
      {
        id: 'defi-basics',
        title: 'DeFi Fundamentals',
        level: 'beginner',
        duration: 30,
        skills: ['smart contracts', 'yield farming', 'liquidity pools']
      }
    ]);

    this.curriculumModules.set('future', [
      {
        id: 'emerging-tech',
        title: 'Emerging Technologies Overview',
        level: 'beginner',
        duration: 45,
        skills: ['technology trends', 'innovation', 'future readiness']
      }
    ]);
  }

  async getResearchStatus() {
    return {
      activeProjects: Array.from(this.projects.values()).filter(p => p.status === 'active').length,
      completedProjects: Array.from(this.projects.values()).filter(p => p.status === 'completed').length,
      totalFindings: this.findings.length,
      lastUpdated: new Date()
    };
  }

  async getRecentFindings(limit = 10) {
    return this.findings
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);
  }

  async createProject(projectData) {
    const project = {
      id: `project_${Date.now()}`,
      ...projectData
    };

    this.projects.set(project.id, project);
    return project;
  }

  async getCurriculumModules() {
    return Object.fromEntries(this.curriculumModules);
  }

  async getInsightsByTopic(topic) {
    // Generate insights based on research findings
    const relevantFindings = this.findings.filter(f =>
      f.category.toLowerCase().includes(topic.toLowerCase()) ||
      f.title.toLowerCase().includes(topic.toLowerCase())
    );

    return relevantFindings.map(finding => ({
      topic,
      insight: finding.summary,
      source: finding.title,
      confidence: Math.random() * 0.3 + 0.7
    }));
  }

  async getProjectsByTopicAndLevel(topic, level) {
    const relevantProjects = Array.from(this.projects.values())
      .filter(p => p.category === topic && p.status === 'active');

    return relevantProjects.map(project => ({
      id: project.id,
      title: project.title,
      difficulty: level,
      description: project.description,
      estimatedTime: this.getEstimatedTime(level)
    }));
  }

  getEstimatedTime(level) {
    const times = {
      beginner: '2-4 weeks',
      intermediate: '1-2 months',
      advanced: '3-6 months',
      expert: '6-12 months'
    };

    return times[level] || '2-4 weeks';
  }

  async saveFinding(finding) {
    const newFinding = {
      id: `finding_${Date.now()}`,
      ...finding,
      date: new Date()
    };

    this.findings.push(newFinding);
    return newFinding;
  }

  async updateProjectStatus(projectId, status) {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = status;
      project.updatedAt = new Date();
      return project;
    }
    return null;
  }

  async getResearchMetrics() {
    const projects = Array.from(this.projects.values());
    const categories = [...new Set(projects.map(p => p.category))];

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      categories: categories.length,
      totalFindings: this.findings.length,
      avgProjectDuration: this.calculateAvgProjectDuration(projects)
    };
  }

  calculateAvgProjectDuration(projects) {
    const completedProjects = projects.filter(p => p.status === 'completed');
    if (completedProjects.length === 0) return 0;

    const totalDuration = completedProjects.reduce((sum, project) => {
      const duration = new Date() - new Date(project.createdAt);
      return sum + duration;
    }, 0);

    return totalDuration / completedProjects.length / (1000 * 60 * 60 * 24); // Convert to days
  }
}

module.exports = new ResearchDatabase();
