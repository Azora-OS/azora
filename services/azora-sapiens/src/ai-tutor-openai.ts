import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TutorContext {
  studentId: string;
  subject: string;
  level: string;
  history: Array<{ role: string; content: string }>;
}

export async function getTutorResponse(question: string, context: TutorContext) {
  const systemPrompt = `You are Elara, an AI tutor for Azora OS. You teach ${context.subject} at ${context.level} level.
Be encouraging, clear, and use the Ubuntu philosophy: "I can because we can."
Break down complex topics into simple steps.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.history,
    { role: 'user', content: question },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}

export async function generateLearningPath(subject: string, currentLevel: string, goals: string[]) {
  const prompt = `Create a learning path for ${subject} at ${currentLevel} level.
Goals: ${goals.join(', ')}
Return a structured JSON with: modules, topics, estimated_hours, prerequisites.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
