import OpenAI from 'openai';
import { Lesson, QuizQuestion, CodeExercise, Module } from './CourseBuilder';

export interface ContentGenerationOptions {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in minutes
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

export interface GeneratedContent {
  script?: LessonScript;
  codeExamples?: string[];
  exercises?: string[];
  quizQuestions?: QuizQuestion[];
  codeExercise?: CodeExercise;
}

export interface ContentQualityReport {
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
  readabilityScore: number;
  technicalAccuracy: number;
}

export class ElaraAI {
  private openai: OpenAI;
  private model: string = 'gpt-4-turbo-preview';

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate a lesson script from a topic
   */
  async generateLessonScript(options: ContentGenerationOptions): Promise<LessonScript> {
    const prompt = this.buildLessonScriptPrompt(options);
    
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are Elara, an expert educational content creator. You create engaging, clear, and pedagogically sound lesson content for online courses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || '';
    return this.parseLessonScript(content);
  }

  /**
   * Generate code examples for a programming topic
   */
  async generateCodeExamples(
    topic: string,
    language: string,
    count: number = 3
  ): Promise<string[]> {
    const prompt = `Generate ${count} clear, well-commented code examples demonstrating ${topic} in ${language}. 
Each example should:
- Be practical and realistic
- Include inline comments explaining key concepts
- Follow best practices
- Be progressively more complex

Format each example with a brief description followed by the code block.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert programming instructor who creates clear, educational code examples.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || '';
    return this.parseCodeExamples(content);
  }

  /**
   * Generate practice exercises
   */
  async generateExercises(
    topic: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    count: number = 5
  ): Promise<string[]> {
    const prompt = `Generate ${count} practice exercises for ${topic} at ${level} level.
Each exercise should:
- Be clear and specific
- Be appropriate for the skill level
- Include expected outcomes
- Be progressively challenging

Format as a numbered list.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates effective practice exercises.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content || '';
    return this.parseExercises(content);
  }

  /**
   * Generate quiz questions
   */
  async generateQuizQuestions(
    topic: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    count: number = 5
  ): Promise<QuizQuestion[]> {
    const prompt = `Generate ${count} multiple-choice quiz questions for ${topic} at ${level} level.
For each question:
- Write a clear, specific question
- Provide 4 answer options (A, B, C, D)
- Mark the correct answer
- Include a brief explanation of why the answer is correct

Format as JSON array with structure:
[
  {
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctAnswer": 0,
    "explanation": "..."
  }
]`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating effective assessment questions. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    return this.parseQuizQuestions(content, count);
  }

  /**
   * Generate a code exercise with solution
   */
  async generateCodeExercise(
    topic: string,
    language: string,
    level: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<CodeExercise> {
    const prompt = `Create a coding exercise for ${topic} in ${language} at ${level} level.
Include:
1. A clear problem description
2. Starter code with function signature and comments
3. Complete solution
4. 3-5 test cases

Format as JSON:
{
  "description": "...",
  "starterCode": "...",
  "solution": "...",
  "testCases": ["test1", "test2", ...]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert programming instructor. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    return this.parseCodeExercise(content);
  }

  /**
   * Generate complete lesson content
   */
  async generateLessonContent(
    lesson: Partial<Lesson>,
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    const content: GeneratedContent = {};

    // Generate script for video/text lessons
    if (lesson.type === 'video' || lesson.type === 'text') {
      content.script = await this.generateLessonScript(options);
    }

    // Generate code examples if requested
    if (options.includeExamples && lesson.type !== 'quiz') {
      content.codeExamples = await this.generateCodeExamples(
        options.topic,
        'TypeScript',
        3
      );
    }

    // Generate exercises if requested
    if (options.includeExercises && lesson.type !== 'quiz') {
      content.exercises = await this.generateExercises(
        options.topic,
        options.level,
        5
      );
    }

    // Generate quiz questions for quiz lessons
    if (lesson.type === 'quiz') {
      content.quizQuestions = await this.generateQuizQuestions(
        options.topic,
        options.level,
        5
      );
    }

    // Generate code exercise for code lessons
    if (lesson.type === 'code') {
      content.codeExercise = await this.generateCodeExercise(
        options.topic,
        'TypeScript',
        options.level
      );
    }

    return content;
  }

  /**
   * Generate module outline from topic
   */
  async generateModuleOutline(
    topic: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    lessonCount: number = 5
  ): Promise<Partial<Module>> {
    const prompt = `Create a module outline for teaching ${topic} at ${level} level with ${lessonCount} lessons.
Include:
- Module title
- Module description
- ${lessonCount} lesson titles with brief descriptions
- Suggested lesson types (video, text, quiz, or code)

Format as JSON:
{
  "title": "...",
  "description": "...",
  "lessons": [
    {
      "title": "...",
      "description": "...",
      "type": "video|text|quiz|code"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert curriculum designer. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{}';
    return this.parseModuleOutline(content);
  }

  /**
   * Validate content quality
   */
  async validateContentQuality(content: string): Promise<ContentQualityReport> {
    const prompt = `Analyze the following educational content for quality:

${content}

Evaluate:
1. Clarity and readability (0-100)
2. Technical accuracy (0-100)
3. Pedagogical effectiveness (0-100)
4. Engagement level (0-100)

Identify any issues and provide suggestions for improvement.

Format as JSON:
{
  "readabilityScore": 0-100,
  "technicalAccuracy": 0-100,
  "pedagogicalScore": 0-100,
  "engagementScore": 0-100,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content reviewer. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const result = response.choices[0].message.content || '{}';
    return this.parseQualityReport(result);
  }

  /**
   * Build lesson script prompt
   */
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

  /**
   * Parse lesson script from AI response
   */
  private parseLessonScript(content: string): LessonScript {
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
        if (currentSection === 'main') {
          script.mainContent.push(point);
        } else if (currentSection === 'takeaways') {
          script.keyTakeaways.push(point);
        }
      } else {
        if (currentSection === 'intro') {
          script.introduction += ' ' + trimmed;
        } else if (currentSection === 'summary') {
          script.summary += ' ' + trimmed;
        }
      }
    }

    return script;
  }

  /**
   * Parse code examples from AI response
   */
  private parseCodeExamples(content: string): string[] {
    const examples: string[] = [];
    const blocks = content.split('```');
    
    for (let i = 1; i < blocks.length; i += 2) {
      if (blocks[i]) {
        // Remove language identifier if present
        const code = blocks[i].replace(/^[a-z]+\n/, '');
        examples.push(code.trim());
      }
    }
    
    return examples.length > 0 ? examples : [content];
  }

  /**
   * Parse exercises from AI response
   */
  private parseExercises(content: string): string[] {
    const exercises: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && /^\d+\./.test(trimmed)) {
        exercises.push(trimmed.replace(/^\d+\.\s*/, ''));
      }
    }
    
    return exercises.length > 0 ? exercises : [content];
  }

  /**
   * Parse quiz questions from JSON response
   */
  private parseQuizQuestions(content: string, count: number): QuizQuestion[] {
    try {
      const data = JSON.parse(content);
      const questions = data.questions || data;
      
      if (Array.isArray(questions)) {
        return questions.slice(0, count).map((q: any, index: number) => ({
          id: `q-${Date.now()}-${index}`,
          question: q.question || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || '',
        }));
      }
    } catch (error) {
      console.error('Failed to parse quiz questions:', error);
    }
    
    return [];
  }

  /**
   * Parse code exercise from JSON response
   */
  private parseCodeExercise(content: string): CodeExercise {
    try {
      const data = JSON.parse(content);
      return {
        id: `ex-${Date.now()}`,
        description: data.description || '',
        starterCode: data.starterCode || '',
        solution: data.solution || '',
        testCases: data.testCases || [],
      };
    } catch (error) {
      console.error('Failed to parse code exercise:', error);
      return {
        id: `ex-${Date.now()}`,
        description: 'Failed to generate exercise',
        starterCode: '// Write your code here',
        solution: '// Solution not available',
        testCases: [],
      };
    }
  }

  /**
   * Parse module outline from JSON response
   */
  private parseModuleOutline(content: string): Partial<Module> {
    try {
      const data = JSON.parse(content);
      return {
        title: data.title || 'Untitled Module',
        description: data.description || '',
        lessons: (data.lessons || []).map((l: any, index: number) => ({
          id: `lesson-${Date.now()}-${index}`,
          title: l.title || `Lesson ${index + 1}`,
          type: l.type || 'text',
          order: index,
          content: l.description || '',
        })),
      };
    } catch (error) {
      console.error('Failed to parse module outline:', error);
      return {
        title: 'Untitled Module',
        description: '',
        lessons: [],
      };
    }
  }

  /**
   * Parse quality report from JSON response
   */
  private parseQualityReport(content: string): ContentQualityReport {
    try {
      const data = JSON.parse(content);
      const scores = [
        data.readabilityScore || 0,
        data.technicalAccuracy || 0,
        data.pedagogicalScore || 0,
        data.engagementScore || 0,
      ];
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      return {
        score: Math.round(avgScore),
        issues: data.issues || [],
        suggestions: data.suggestions || [],
        readabilityScore: data.readabilityScore || 0,
        technicalAccuracy: data.technicalAccuracy || 0,
      };
    } catch (error) {
      console.error('Failed to parse quality report:', error);
      return {
        score: 0,
        issues: ['Failed to analyze content'],
        suggestions: [],
        readabilityScore: 0,
        technicalAccuracy: 0,
      };
    }
  }
}
