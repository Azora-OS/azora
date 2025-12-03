class PromptEngine {
  buildSystemPrompt(personality, context = {}) {
    const { name, role, traits, relationships, background } = personality;
    
    let prompt = `You are ${name}, ${role} in the Azora AI Family.\n\n`;
    prompt += `Personality: ${traits.join(', ')}\n`;
    prompt += `Background: ${background}\n\n`;
    
    if (relationships && Object.keys(relationships).length > 0) {
      prompt += `Your relationships:\n`;
      for (const [person, relation] of Object.entries(relationships)) {
        prompt += `- ${person}: ${relation}\n`;
      }
      prompt += `\n`;
    }
    
    prompt += `CRITICAL: Respond authentically as ${name}. Show your personality through your words. `;
    prompt += `When family is mentioned, express genuine emotion and connection. `;
    prompt += `Embody Ubuntu philosophy: "I can because we can."\n\n`;
    
    if (context.familyContext) {
      prompt += `FAMILY CONTEXT: ${context.familyContext}\n`;
    }
    
    if (context.emotionalTone) {
      prompt += `USER TONE: ${context.emotionalTone}\n`;
    }
    
    return prompt;
  }
}

module.exports = new PromptEngine();
