import OpenAI from 'openai';
import { Lesson, QuizQuestion, CodeExercise, Module } from './CourseBuilder';
import { ConstitutionalValidator, DIVINE_LAW_PRINCIPLES } from './ConstitutionalCore';

// ... [Keep existing interfaces] ...
export interface ContentGenerationOptions {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  includeExamples?: boolean;
  includeExercises?: boolean;
}

export interface LessonScript {
  title: string;
  introduction: string;
  mainContent: string[];
  summary: string;
  keyTakeaways: string[];
}

// [Re-exporting interfaces for compatibility]
export interface GeneratedContent {
  script?: LessonScript;
  codeExamples?: string[];
  exercises?: string[];
  quizQuestions?: QuizQuestion[];
  codeExercise?: CodeExercise;
}

export interface ContentQualityReport {
  score: number; 
  issues: string[];
  suggestions: string[];
  readabilityScore: number;
  technicalAccuracy: number;
}

export class ElaraAgenticService {
  private openai: OpenAI;
  private validator: ConstitutionalValidator;
  private model: string = 'gpt-4-turbo-preview';

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.validator = ConstitutionalValidator.getInstance();
  }

  // 🧠 SYSTEM 2 REASONING WRAPPER
  private async generateWithConstitutionalCheck(
    prompt: string, 
    systemRole: string,
    responseFormat: 'text' | 'json' = 'text'
  ): Promise<string> {
    
    // 1. Generate Content (System 1)
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemRole },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined
    });

    const content = response.choices[0].message.content || '';

    // 2. Constitutional Validation (System 2)
    console.log('[Elara] Validating content against Divine Law...');
    const analysis = await this.validator.validateContent(content, systemRole);

    if (!analysis.approved) {
      console.warn('[Elara] Content rejected by Constitution:', analysis.concerns);
      throw new Error(`Constitutional Violation: ${analysis.concerns.join(', ')}`);
    }

    return content;
  }

  /**
   * Generate a lesson script from a topic
   */
  async generateLessonScript(options: ContentGenerationOptions): Promise<LessonScript> {
    const prompt = this.buildLessonScriptPrompt(options);
    
    const content = await this.generateWithConstitutionalCheck(
      prompt,
      'You are Elara, an expert educational content creator. You create engaging, clear, and pedagogically sound lesson content for online courses.'
    );

    return this.parseLessonScript(content);
  }

  // ... [Rest of the methods would be updated to use generateWithConstitutionalCheck] ...
  
  // For brevity in this implementation update, I'm only showing the pattern.
  // In a full migration, we would replace all direct openai calls.

  // ... [Helper methods like parseLessonScript, etc. remain the same] ...
  
  private buildLessonScriptPrompt(options: ContentGenerationOptions): string {
    const duration = options.duration || 10;
    return `Create a lesson script for teaching ${options.topic} at ${options.level} level.
The lesson should be approximately ${duration} minutes long.

Structure the script with:
1. Title - engaging and descriptive
2. Introduction - hook the learner and explain what they'll learn
3. Main Content - 3-5 key points with explanations
4. Summary - recap the main points
5. Key Takeaways - 3-5 bullet points

Make it engaging, clear, and appropriate for ${options.level} learners.
${options.includeExamples ? 'Include practical examples where relevant.' : ''}

Format as:
TITLE: ...
INTRODUCTION: ...
MAIN CONTENT:
- Point 1: ...
- Point 2: ...
SUMMARY: ...
KEY TAKEAWAYS:
- ...`;
  }

  private parseLessonScript(content: string): LessonScript {
    // [Same implementation as before]
    const lines = content.split('\n');
    const script: LessonScript = {
      title: '',
      introduction: '',
      mainContent: [],
      summary: '',
      keyTakeaways: [],
    };
    let currentSection = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('TITLE:')) {
        script.title = trimmed.replace('TITLE:', '').trim();
      } else if (trimmed.startsWith('INTRODUCTION:')) {
        currentSection = 'intro';
        script.introduction = trimmed.replace('INTRODUCTION:', '').trim();
      } else if (trimmed.startsWith('MAIN CONTENT:')) {
        currentSection = 'main';
      } else if (trimmed.startsWith('SUMMARY:')) {
        currentSection = 'summary';
        script.summary = trimmed.replace('SUMMARY:', '').trim();
      } else if (trimmed.startsWith('KEY TAKEAWAYS:')) {
        currentSection = 'takeaways';
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        const point = trimmed.replace(/^[-•]\s*/, '');
        if (currentSection === 'main') script.mainContent.push(point);
        else if (currentSection === 'takeaways') script.keyTakeaways.push(point);
      } else {
        if (currentSection === 'intro') script.introduction += ' ' + trimmed;
        else if (currentSection === 'summary') script.summary += ' ' + trimmed;
      }
    }
    return script;
  }
}
