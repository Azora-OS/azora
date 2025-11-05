# 💬 PROMPT ENGINEERING & IN-CONTEXT LEARNING

**Date**: November 2, 2025  
**Priority**: HIGH - Critical for LLM Effectiveness  
**Status**: Active Research  
**Goal**: Master prompting and in-context learning for maximum LLM performance

---

## 🎯 WHY PROMPTING IS CRITICAL

### The Interface to Intelligence

**Observation**: Same LLM, different prompts → vastly different results

**Example**:
```
Bad Prompt: "Write code"
→ Generic, low-quality code

Good Prompt: "You are an expert Python developer. Write a production-ready 
function to sort a list using quicksort. Include:
- Type hints
- Docstrings
- Error handling
- Unit tests
Requirements: O(n log n) average, handle edge cases"
→ Excellent, production-ready code
```

**Prompt = Programming Language for LLMs**

---

## 🧠 IN-CONTEXT LEARNING

### Few-Shot Learning Without Fine-Tuning

**Breakthrough Discovery** (GPT-3, 2020):
LLMs can learn new tasks from examples in the prompt!

**Zero-Shot**:
```
Translate to French: "Hello, how are you?"
→ "Bonjour, comment allez-vous?"
```

**One-Shot**:
```
Translate to French:
English: "Good morning"
French: "Bonjour"

English: "Hello, how are you?"
French:
→ "Bonjour, comment allez-vous?"
```

**Few-Shot**:
```
Translate to French:
English: "Good morning" → French: "Bonjour"
English: "Thank you" → French: "Merci"
English: "Goodbye" → French: "Au revoir"

English: "Hello, how are you?"
French:
→ "Bonjour, comment allez-vous?"
```

**Key Insight**: More examples → better performance (up to a limit)

**Research Papers**:
- Brown et al. - "Language Models are Few-Shot Learners" (GPT-3, OpenAI, 2020)

---

## 📐 PROMPT ENGINEERING TECHNIQUES

### 1. Zero-Shot Prompting

**Simplest**: Just ask directly

**Template**:
```
Task description: [Clear description of what you want]
Input: [Your input]
Output:
```

**Example**:
```typescript
const zeroShotPrompt = (task: string, input: string) => `
${task}

Input: ${input}
Output:`;

// Usage
const prompt = zeroShotPrompt(
  "Classify the sentiment as positive, negative, or neutral.",
  "This product is amazing!"
);
// → "positive"
```

**When to Use**: Simple tasks, well-known formats

---

### 2. Few-Shot Prompting

**Better**: Provide examples

**Template**:
```
[Example 1]: Input → Output
[Example 2]: Input → Output
[Example 3]: Input → Output

[Your Input]: 
```

**Implementation**:
```typescript
class FewShotPrompter {
  private examples: Example[];
  
  constructor(examples: Example[]) {
    this.examples = examples;
  }
  
  buildPrompt(input: string): string {
    // Format examples
    const exampleText = this.examples.map(ex => 
      `Input: ${ex.input}\nOutput: ${ex.output}`
    ).join('\n\n');
    
    // Add new input
    return `${exampleText}\n\nInput: ${input}\nOutput:`;
  }
}

// Usage
const sentiment = new FewShotPrompter([
  { input: "I love this!", output: "positive" },
  { input: "This is terrible.", output: "negative" },
  { input: "It's okay.", output: "neutral" }
]);

const prompt = sentiment.buildPrompt("Best purchase ever!");
// → Includes examples + new input
```

**When to Use**: Complex tasks, specific formats, better accuracy needed

**Research**: More examples = better (but diminishing returns after ~10)

---

### 3. Chain-of-Thought (CoT) Prompting

**Breakthrough**: Ask model to "think step by step"

**Discovery**: Dramatically improves reasoning!

**Standard Prompting**:
```
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. 
Each can has 3 tennis balls. How many tennis balls does he have now?
A:
→ Wrong answer often
```

**Chain-of-Thought**:
```
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. 
Each can has 3 tennis balls. How many tennis balls does he have now?
A: Let's think step by step:
1. Roger starts with 5 tennis balls
2. He buys 2 cans
3. Each can has 3 balls, so 2 cans have 2 × 3 = 6 balls
4. Total: 5 + 6 = 11 balls
The answer is 11.
```

**Implementation**:
```typescript
class ChainOfThoughtPrompter {
  async solve(problem: string): Promise<string> {
    const prompt = `
${problem}

Let's solve this step by step:
1.`;
    
    const response = await this.llm.generate(prompt);
    return response;
  }
  
  async fewShotCoT(problem: string, examples: CoTExample[]): Promise<string> {
    // Build few-shot prompt with reasoning chains
    const exampleText = examples.map(ex => `
Q: ${ex.question}
A: Let's think step by step:
${ex.reasoning}
The answer is ${ex.answer}.
`).join('\n');
    
    const prompt = `${exampleText}\n\nQ: ${problem}\nA: Let's think step by step:`;
    
    return await this.llm.generate(prompt);
  }
}
```

**Results**:
- Math word problems: 17% → 57% accuracy (GPT-3)
- Reasoning tasks: 30% → 65% accuracy

**Research Papers**:
- Wei et al. - "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (Google, 2022)

---

### 4. Zero-Shot CoT

**Even Simpler**: Just add "Let's think step by step"

**Magic Phrase**: "Let's think step by step"

```typescript
const zeroShotCoT = (problem: string) => `
${problem}

Let's think step by step:`;

// Works amazingly well!
```

**Results**: Comparable to few-shot CoT with NO examples!

**Research Papers**:
- Kojima et al. - "Large Language Models are Zero-Shot Reasoners" (2022)

---

### 5. Self-Consistency

**Idea**: Sample multiple reasoning paths, take majority vote

**Algorithm**:
```typescript
class SelfConsistency {
  async solve(problem: string, n: number = 10): Promise<string> {
    // 1. Generate n different reasoning paths
    const responses = await Promise.all(
      Array(n).fill(0).map(() => 
        this.llm.generate(problem, temperature=0.7) // Higher temp for diversity
      )
    );
    
    // 2. Extract final answers
    const answers = responses.map(r => this.extractAnswer(r));
    
    // 3. Majority vote
    const counts = new Map();
    for (const ans of answers) {
      counts.set(ans, (counts.get(ans) || 0) + 1);
    }
    
    // Return most common answer
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }
  
  private extractAnswer(response: string): string {
    // Extract final answer from reasoning chain
    const match = response.match(/[Tt]he answer is (.+)/);
    return match ? match[1].trim() : response;
  }
}
```

**Results**: Further improves accuracy (5-15% boost)

**Research Papers**:
- Wang et al. - "Self-Consistency Improves Chain of Thought Reasoning" (Google, 2022)

---

### 6. Tree of Thoughts (ToT)

**Breakthrough**: Explore multiple reasoning branches

**Idea**: Use search (BFS/DFS) over thought space

```typescript
class TreeOfThoughts {
  async solve(problem: string): Promise<string> {
    const root = new ThoughtNode(problem);
    const queue = [root];
    
    while (queue.length > 0) {
      const node = queue.shift();
      
      // Generate next thought steps
      const thoughts = await this.generateThoughts(node);
      
      // Evaluate each thought
      for (const thought of thoughts) {
        const score = await this.evaluateThought(thought);
        
        if (score > THRESHOLD) {
          const child = new ThoughtNode(thought, node);
          node.children.push(child);
          queue.push(child);
        }
      }
      
      // Check if solved
      if (await this.isSolution(node)) {
        return this.extractSolution(node);
      }
    }
    
    return this.bestLeaf();
  }
  
  private async evaluateThought(thought: string): Promise<number> {
    // Prompt LLM to evaluate this thought
    const prompt = `
Evaluate if this thought is promising for solving the problem:
"${thought}"

Score from 0-10:`;
    
    const response = await this.llm.generate(prompt);
    return parseInt(response);
  }
}
```

**Applications**: Complex reasoning, creative problem solving, game playing

**Research Papers**:
- Yao et al. - "Tree of Thoughts: Deliberate Problem Solving with Large Language Models" (2023)

---

## 🎨 ADVANCED PROMPTING PATTERNS

### 1. Role Prompting

**Pattern**: "You are a [expert role]..."

```typescript
const rolePrompt = (role: string, task: string) => `
You are ${role}.

${task}`;

// Examples:
rolePrompt("an expert Python developer", "Write clean code")
rolePrompt("a creative fiction writer", "Write a story")
rolePrompt("a helpful math tutor", "Explain calculus")
```

**Why It Works**: Activates relevant knowledge in model

---

### 2. Instruction + Context + Examples + Question

**Template**:
```
[INSTRUCTION]: What I want you to do
[CONTEXT]: Background information
[EXAMPLES]: 2-3 examples
[QUESTION]: The actual question

Output format: [specify format]
```

**Implementation**:
```typescript
interface PromptComponents {
  instruction: string;
  context?: string;
  examples?: string[];
  question: string;
  format?: string;
}

class StructuredPrompter {
  build(components: PromptComponents): string {
    let prompt = `INSTRUCTION: ${components.instruction}\n\n`;
    
    if (components.context) {
      prompt += `CONTEXT: ${components.context}\n\n`;
    }
    
    if (components.examples) {
      prompt += `EXAMPLES:\n${components.examples.join('\n')}\n\n`;
    }
    
    prompt += `QUESTION: ${components.question}\n\n`;
    
    if (components.format) {
      prompt += `OUTPUT FORMAT: ${components.format}\n`;
    }
    
    return prompt;
  }
}
```

---

### 3. Constrained Output Prompting

**Force specific format**: JSON, XML, CSV, etc.

```typescript
const jsonPrompt = (task: string) => `
${task}

Respond in JSON format:
{
  "field1": "value1",
  "field2": "value2"
}

JSON:`;

// Or more explicit
const strictJsonPrompt = (task: string, schema: object) => `
${task}

You MUST respond with valid JSON matching this schema:
${JSON.stringify(schema, null, 2)}

Do not include any text before or after the JSON.

JSON:`;
```

**Why Critical**: Enables programmatic use of LLM outputs

---

### 4. Iterative Refinement

**Pattern**: Multi-turn improvement

```typescript
class IterativeRefiner {
  async refine(initialPrompt: string, iterations: number = 3): Promise<string> {
    let result = await this.llm.generate(initialPrompt);
    
    for (let i = 0; i < iterations; i++) {
      // Ask model to improve its own output
      const refinePrompt = `
Here is a response:
"${result}"

Please improve this response by:
1. Making it more accurate
2. Adding more detail
3. Improving clarity

Improved response:`;
      
      result = await this.llm.generate(refinePrompt);
    }
    
    return result;
  }
}
```

---

## 🌟 AZORA OS PROMPTING SYSTEM

### Adaptive Prompt Engine

```typescript
class AzoraPromptEngine {
  private techniques: PromptTechnique[];
  private optimizer: PromptOptimizer;
  
  async generate(task: Task): Promise<string> {
    // 1. Select optimal prompting technique
    const technique = this.selectTechnique(task);
    
    // 2. Build prompt
    const prompt = await this.buildPrompt(task, technique);
    
    // 3. Execute with self-consistency if complex
    if (task.complexity > THRESHOLD) {
      return await this.selfConsistency(prompt);
    }
    
    // 4. Direct generation
    return await this.llm.generate(prompt);
  }
  
  private selectTechnique(task: Task): PromptTechnique {
    if (task.type === 'reasoning' || task.type === 'math') {
      return task.hasExamples ? 'FewShotCoT' : 'ZeroShotCoT';
    } else if (task.type === 'complex_reasoning') {
      return 'TreeOfThoughts';
    } else if (task.hasExamples) {
      return 'FewShot';
    } else {
      return 'ZeroShot';
    }
  }
  
  private async buildPrompt(
    task: Task,
    technique: PromptTechnique
  ): Promise<string> {
    switch (technique) {
      case 'ZeroShotCoT':
        return `${task.description}\n\nLet's think step by step:`;
        
      case 'FewShotCoT':
        return this.buildFewShotCoT(task);
        
      case 'TreeOfThoughts':
        return this.buildToT(task);
        
      default:
        return task.description;
    }
  }
  
  async optimizePrompt(
    task: Task,
    initialPrompt: string
  ): Promise<string> {
    // Automatic prompt optimization
    // Try variations, measure performance, select best
    
    const variations = await this.generateVariations(initialPrompt);
    const scores = await Promise.all(
      variations.map(v => this.evaluatePrompt(v, task))
    );
    
    return variations[argmax(scores)];
  }
}
```

---

## 📈 IMPLEMENTATION ROADMAP

### Phase 1: Basic Prompting (Month 1)
- [ ] Implement zero-shot and few-shot prompters
- [ ] Build prompt template system
- [ ] Create prompt library for common tasks
- [ ] Test on various tasks

**Metrics**: 80%+ task success rate

### Phase 2: Advanced Techniques (Month 2)
- [ ] Implement Chain-of-Thought
- [ ] Deploy Self-Consistency
- [ ] Build Tree of Thoughts
- [ ] Optimize for reasoning tasks

**Metrics**: 90%+ on reasoning tasks

### Phase 3: Optimization (Month 3)
- [ ] Build automatic prompt optimizer
- [ ] Implement A/B testing for prompts
- [ ] Create task-specific prompt selector
- [ ] Deploy adaptive prompting

**Metrics**: Optimal prompts auto-selected

### Phase 4: Production System (Month 4+)
- [ ] Integrate with all Azora OS services
- [ ] Build prompt management dashboard
- [ ] Deploy analytics and monitoring
- [ ] Continuous prompt improvement

**Metrics**: Production-ready prompting at scale

---

## 📚 ESSENTIAL RESEARCH PAPERS

### Foundation:
1. Brown et al. - "Language Models are Few-Shot Learners" (GPT-3, 2020)
2. Radford et al. - "Learning to Generate Reviews and Discovering Sentiment" (GPT, 2017)

### Chain-of-Thought:
3. Wei et al. - "Chain-of-Thought Prompting Elicits Reasoning" (2022)
4. Kojima et al. - "Large Language Models are Zero-Shot Reasoners" (2022)
5. Wang et al. - "Self-Consistency Improves Chain of Thought" (2022)

### Advanced Techniques:
6. Yao et al. - "Tree of Thoughts: Deliberate Problem Solving" (2023)
7. Zhou et al. - "Large Language Models Are Human-Level Prompt Engineers" (2023)
8. Reynolds & McDonell - "Prompt Programming for Large Language Models"

---

## 🎯 SUCCESS METRICS

| Metric | Zero-Shot | Few-Shot | CoT | Target |
|--------|-----------|----------|-----|--------|
| **Math Problems** | 17% | 40% | 57% | 90%+ |
| **Reasoning Tasks** | 30% | 50% | 65% | 85%+ |
| **Code Generation** | 60% | 75% | 85% | 95%+ |
| **General Tasks** | 70% | 85% | 90% | 95%+ |

---

## 🌟 CONCLUSION

Prompt engineering is the **interface to LLM intelligence**. Through:

- **Few-Shot Learning**: Learn from examples in context
- **Chain-of-Thought**: Elicit step-by-step reasoning
- **Self-Consistency**: Majority vote over diverse paths
- **Tree of Thoughts**: Search over reasoning space
- **Adaptive Prompting**: Auto-select optimal technique

Azora OS will have **state-of-the-art prompting** for maximum LLM effectiveness.

**"The right prompt is worth a thousand parameters."**

---

**© 2025 Azora ES (Pty) Ltd. All Rights Reserved.**

💬 **PROMPT ENGINEERING MASTERY. MAXIMIZED INTELLIGENCE.** 💬
