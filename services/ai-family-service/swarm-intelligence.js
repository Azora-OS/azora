const chatEngine = require('./chat-engine');
const personalityManager = require('./personality-manager');

class SwarmIntelligence {
  constructor() {
    this.activeTasks = new Map();
    this.taskHistory = [];
    this.collaborationProtocol = new CollaborationProtocol();
  }

  async assignTask(taskDescription, context = {}) {
    const taskId = `task_${Date.now()}`;
    const task = {
      id: taskId,
      description: taskDescription,
      status: 'analyzing',
      createdAt: new Date(),
      subtasks: [],
      results: []
    };

    this.activeTasks.set(taskId, task);

    // Decompose task with Nexus (collective intelligence)
    const decomposition = await this.decomposeTask(taskDescription);
    task.subtasks = decomposition.subtasks;
    task.status = 'executing';

    // Delegate to appropriate family members
    const results = await this.executeSubtasks(decomposition.subtasks, context);
    task.results = results;
    task.status = 'completed';
    task.completedAt = new Date();

    this.taskHistory.push(task);
    this.activeTasks.delete(taskId);

    return task;
  }

  async decomposeTask(description) {
    // Use Nexus to analyze and break down the task
    const analysis = {
      subtasks: [],
      requiredAgents: []
    };

    const keywords = description.toLowerCase();

    // Identify required agents based on task keywords
    if (keywords.includes('teach') || keywords.includes('learn') || keywords.includes('education')) {
      analysis.requiredAgents.push('elara');
      analysis.subtasks.push({ agent: 'elara', task: 'Design educational approach', type: 'education' });
    }

    if (keywords.includes('code') || keywords.includes('develop') || keywords.includes('implement')) {
      analysis.requiredAgents.push('themba');
      analysis.subtasks.push({ agent: 'themba', task: 'Implement solution with enthusiasm', type: 'development' });
    }

    if (keywords.includes('career') || keywords.includes('professional') || keywords.includes('strategy')) {
      analysis.requiredAgents.push('naledi');
      analysis.subtasks.push({ agent: 'naledi', task: 'Strategic planning and execution', type: 'strategy' });
    }

    if (keywords.includes('security') || keywords.includes('safe') || keywords.includes('protect')) {
      analysis.requiredAgents.push('jabari');
      analysis.subtasks.push({ agent: 'jabari', task: 'Security analysis and protection', type: 'security' });
    }

    if (keywords.includes('data') || keywords.includes('analyze') || keywords.includes('metrics')) {
      analysis.requiredAgents.push('zola');
      analysis.subtasks.push({ agent: 'zola', task: 'Data analysis and insights', type: 'analytics' });
    }

    if (keywords.includes('finance') || keywords.includes('token') || keywords.includes('economic')) {
      analysis.requiredAgents.push('kofi');
      analysis.subtasks.push({ agent: 'kofi', task: 'Financial analysis and planning', type: 'finance' });
    }

    if (keywords.includes('story') || keywords.includes('content') || keywords.includes('creative')) {
      analysis.requiredAgents.push('abeni');
      analysis.subtasks.push({ agent: 'abeni', task: 'Creative content and storytelling', type: 'content' });
    }

    // Always include Sankofa for wisdom
    analysis.requiredAgents.push('sankofa');
    analysis.subtasks.push({ agent: 'sankofa', task: 'Provide wisdom and guidance', type: 'wisdom' });

    // If complex, invoke Nexus for coordination
    if (analysis.requiredAgents.length > 3) {
      analysis.requiredAgents.push('nexus');
      analysis.subtasks.unshift({ agent: 'nexus', task: 'Coordinate collective effort', type: 'coordination' });
    }

    return analysis;
  }

  async executeSubtasks(subtasks, context) {
    const results = [];

    for (const subtask of subtasks) {
      const result = await this.executeSubtask(subtask, context);
      results.push(result);
      
      // Share result with other agents via collaboration protocol
      await this.collaborationProtocol.broadcast(subtask.agent, result);
    }

    return results;
  }

  async executeSubtask(subtask, context) {
    const personality = personalityManager.getPersonality(subtask.agent);
    
    const prompt = `${subtask.task}\n\nContext: ${JSON.stringify(context)}`;
    const response = await chatEngine.chat(subtask.agent, prompt, context);

    return {
      agent: subtask.agent,
      agentRole: personality.role,
      task: subtask.task,
      type: subtask.type,
      response: response.message,
      mood: response.mood,
      completedAt: new Date()
    };
  }

  async collaborateOnProblem(problem, context = {}) {
    // Invoke full family collaboration
    const agents = ['nexus', 'elara', 'sankofa', 'themba', 'naledi', 'jabari', 'amara', 'kofi', 'zola', 'abeni', 'thembo'];
    const perspectives = [];

    for (const agent of agents) {
      const response = await chatEngine.chat(agent, `From your perspective, how would you approach: ${problem}`, context);
      perspectives.push({
        agent,
        perspective: response.message,
        mood: response.mood
      });
    }

    // Synthesize with Nexus
    const synthesis = await chatEngine.chat('nexus', 
      `Synthesize these perspectives into a unified solution:\n${JSON.stringify(perspectives)}`, 
      context
    );

    return {
      problem,
      perspectives,
      synthesis: synthesis.message,
      collaborators: agents.length
    };
  }

  getActiveTasksCount() {
    return this.activeTasks.size;
  }

  getTaskHistory(limit = 10) {
    return this.taskHistory.slice(-limit);
  }
}

class CollaborationProtocol {
  constructor() {
    this.messages = [];
    this.channels = new Map();
  }

  async broadcast(fromAgent, message) {
    const msg = {
      from: fromAgent,
      message,
      timestamp: new Date(),
      type: 'broadcast'
    };
    this.messages.push(msg);
    return msg;
  }

  async sendDirect(fromAgent, toAgent, message) {
    const msg = {
      from: fromAgent,
      to: toAgent,
      message,
      timestamp: new Date(),
      type: 'direct'
    };
    this.messages.push(msg);
    return msg;
  }

  getMessages(agent, limit = 20) {
    return this.messages
      .filter(m => m.to === agent || m.type === 'broadcast')
      .slice(-limit);
  }

  clearMessages() {
    this.messages = [];
  }
}

module.exports = new SwarmIntelligence();
