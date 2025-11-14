import OpenAI from 'openai';

interface LearningGoal {
  subject: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  targetLevel: 'intermediate' | 'advanced' | 'expert';
  timeframe?: number;
}

interface LearningPathStep {
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  resources: string[];
  assessmentCriteria: string[];
}

interface LearningPath {
  goal: LearningGoal;
  steps: LearningPathStep[];
  totalEstimatedHours: number;
  milestones: string[];
  generatedAt: Date;
}

class LearningPathGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generatePath(goal: LearningGoal, studentProfile?: any): Promise<LearningPath> {
    const prompt = this.buildPrompt(goal, studentProfile);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert educational curriculum designer. Create structured, achievable learning paths.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '{}';
    const pathData = this.parseAIResponse(content);
    
    return {
      goal,
      steps: pathData.steps || this.generateDefaultSteps(goal),
      totalEstimatedHours: pathData.totalHours || 40,
      milestones: pathData.milestones || [],
      generatedAt: new Date()
    };
  }

  private buildPrompt(goal: LearningGoal, profile?: any): string {
    let prompt = `Create a detailed learning path for:\n`;
    prompt += `Subject: ${goal.subject}\n`;
    prompt += `Current Level: ${goal.currentLevel}\n`;
    prompt += `Target Level: ${goal.targetLevel}\n`;
    
    if (goal.timeframe) {
      prompt += `Timeframe: ${goal.timeframe} weeks\n`;
    }
    
    if (profile) {
      prompt += `\nStudent Profile:\n`;
      prompt += `- Learning Style: ${profile.learningStyle || 'mixed'}\n`;
      prompt += `- Previous Experience: ${profile.experience || 'none'}\n`;
    }
    
    prompt += `\nProvide a JSON response with: steps (array of {order, title, description, estimatedHours, resources, assessmentCriteria}), totalHours, milestones`;
    
    return prompt;
  }

  private parseAIResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }
    return {};
  }

  private generateDefaultSteps(goal: LearningGoal): LearningPathStep[] {
    const levelMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const currentNum = levelMap[goal.currentLevel];
    const targetNum = levelMap[goal.targetLevel];
    const stepCount = (targetNum - currentNum) * 3;

    return Array.from({ length: stepCount }, (_, i) => ({
      order: i + 1,
      title: `${goal.subject} - Step ${i + 1}`,
      description: `Learning milestone ${i + 1} for ${goal.subject}`,
      estimatedHours: 5,
      resources: ['Course materials', 'Practice exercises'],
      assessmentCriteria: ['Complete exercises', 'Pass quiz']
    }));
  }

  async adaptPath(pathId: string, studentProgress: any): Promise<LearningPath> {
    // Adapt learning path based on student performance
    // This would integrate with progress tracking
    throw new Error('Not implemented - requires database integration');
  }
}

export default new LearningPathGenerator();
