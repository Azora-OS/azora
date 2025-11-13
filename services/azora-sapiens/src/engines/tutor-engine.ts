import OpenAI from 'openai';

interface TutorSessionContext {
  previousMessages?: { role: 'user' | 'assistant'; content: string }[];
}

interface TutorSessionResult {
  answer: string;
  subject: string;
  studentId: string;
  timestamp: Date;
}

class TutorEngine {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async tutorSession(studentId: string, subject: string, question: string, context: TutorSessionContext = {}): Promise<TutorSessionResult> {
    const systemPrompt = `You are Elara, an AI tutor from Azora OS. You teach ${subject} with patience and Ubuntu philosophy. Break down complex concepts, use examples, and encourage the student. Adapt to their level.`

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ];

    if (context.previousMessages) {
      messages.splice(1, 0, ...context.previousMessages);
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
    });

    const messageContent = response.choices[0].message.content;

    return {
      answer: messageContent ? messageContent : "I am sorry, I could not generate a response.",
      subject,
      studentId,
      timestamp: new Date(),
    };
  }

  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<string> {
    const prompt = `Explain ${concept} at a ${level} level with examples and analogies.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert educator explaining concepts clearly.' },
        { role: 'user', content: prompt },
      ],
    });
    
    const messageContent = response.choices[0].message.content;
    return messageContent ? messageContent : "I am sorry, I could not generate an explanation.";
  }
}

export default new TutorEngine();
