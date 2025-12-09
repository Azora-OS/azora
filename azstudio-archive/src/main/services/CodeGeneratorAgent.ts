import { AIOrchestrator, AIContext } from './AIOrchestrator';
import { Task } from './PlannerAgent';
import * as fs from 'fs';
import * as path from 'path';

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'create' | 'modify';
}

export interface GenerationResult {
  files: GeneratedFile[];
  success: boolean;
  error?: string;
}

export class CodeGeneratorAgent {
  private aiOrchestrator: AIOrchestrator;

  constructor(aiOrchestrator: AIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
  }

  async generateCode(task: Task, context: AIContext): Promise<GenerationResult> {
    console.log(`Generating code for task: ${task.description}`);

    try {
      const files: GeneratedFile[] = [];

      for (const targetFile of task.targetFiles) {
        const fileExists = await this.fileExists(targetFile);
        const generatedContent = await this.generateFileContent(
          task,
          targetFile,
          fileExists,
          context
        );

        files.push({
          path: targetFile,
          content: generatedContent,
          type: fileExists ? 'modify' : 'create',
        });
      }

      return {
        files,
        success: true,
      };
    } catch (error) {
      return {
        files: [],
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async generateFileContent(
    task: Task,
    filePath: string,
    fileExists: boolean,
    context: AIContext
  ): Promise<string> {
    const prompt = this.buildGenerationPrompt(task, filePath, fileExists);
    
    // Check if file content is already in context (from previous tasks)
    const contextFile = context.files.find(f => f.path === filePath);
    
    if (contextFile) {
      // Already in context, no need to read from disk or add again
      // just proceed to generation
    } else if (fileExists) {
      try {
        const existingContent = await fs.promises.readFile(filePath, 'utf-8');
        context.files.push({
          path: filePath,
          content: existingContent,
        });
      } catch (error) {
        console.error(`Failed to read existing file ${filePath}:`, error);
      }
    }

    const response = await this.aiOrchestrator.generateCode(prompt, context);
    
    // Extract code from response (remove markdown code blocks if present)
    return this.extractCode(response.content);
  }

  private buildGenerationPrompt(task: Task, filePath: string, fileExists: boolean): string {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);

    let prompt = `# Task\n${task.description}\n\n`;
    
    if (fileExists) {
      prompt += `# Operation\nModify the existing file: ${fileName}\n\n`;
      prompt += `The current file content is provided in the context.\n\n`;
    } else {
      prompt += `# Operation\nCreate a new file: ${fileName}\n\n`;
    }

    prompt += `# Requirements\n`;
    prompt += `- Write clean, production-ready code\n`;
    prompt += `- Follow TypeScript best practices\n`;
    prompt += `- Include proper error handling\n`;
    prompt += `- Add JSDoc comments for public APIs\n`;
    prompt += `- Use modern ES6+ syntax\n`;
    prompt += `- Follow the project's existing patterns\n\n`;

    // Add language-specific instructions
    if (fileExt === '.ts' || fileExt === '.tsx') {
      prompt += `# TypeScript Guidelines\n`;
      prompt += `- Use explicit types (avoid 'any')\n`;
      prompt += `- Define interfaces for complex objects\n`;
      prompt += `- Use type guards where appropriate\n`;
      prompt += `- Export types that might be reused\n\n`;
    }

    if (fileExt === '.tsx') {
      prompt += `# React Guidelines\n`;
      prompt += `- Use functional components with hooks\n`;
      prompt += `- Properly type props and state\n`;
      prompt += `- Use React.FC or explicit return types\n`;
      prompt += `- Follow React best practices\n\n`;
    }

    prompt += `# Output\n`;
    prompt += `Provide ONLY the complete file content. Do not include explanations or markdown formatting.\n`;

    return prompt;
  }

  private extractCode(aiResponse: string): string {
    // Remove markdown code blocks if present
    const codeBlockMatch = aiResponse.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // If no code block, return the response as-is (might already be clean code)
    return aiResponse.trim();
  }

  async generateService(serviceName: string, serviceType: string, context: AIContext): Promise<GenerationResult> {
    const prompt = `
Create a complete ${serviceType} service named ${serviceName} with the following structure:

1. Service class with core business logic
2. Controller for handling HTTP requests
3. Repository for data access
4. TypeScript interfaces and types
5. Error handling middleware
6. Input validation using Zod

Follow these patterns:
- Use dependency injection
- Implement proper error handling
- Add logging for important operations
- Include JSDoc comments
- Follow SOLID principles

Generate the complete service implementation.
`;

    const response = await this.aiOrchestrator.generateCode(prompt, context);
    
    // Parse the response to extract multiple files
    const files = this.parseMultiFileResponse(response.content, serviceName);

    return {
      files,
      success: true,
    };
  }

  async generateComponent(componentName: string, componentType: string, context: AIContext): Promise<GenerationResult> {
    const prompt = `
Create a React component named ${componentName} of type ${componentType}.

Requirements:
- Use TypeScript with proper typing
- Use functional component with hooks
- Include proper prop types
- Add CSS module or styled-components
- Follow React best practices
- Make it accessible (ARIA attributes)
- Add loading and error states if applicable

Generate the complete component implementation.
`;

    const response = await this.aiOrchestrator.generateCode(prompt, context);
    
    const files = this.parseMultiFileResponse(response.content, componentName);

    return {
      files,
      success: true,
    };
  }

  private parseMultiFileResponse(response: string, baseName: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Try to extract multiple code blocks
    const codeBlocks = response.matchAll(/```(?:\w+)?\s*(?:\/\/\s*(.+?))?\n([\s\S]*?)```/g);
    
    let index = 0;
    for (const match of codeBlocks) {
      const fileName = match[1] || `${baseName}-${index}.ts`;
      const content = match[2].trim();
      
      files.push({
        path: fileName,
        content,
        type: 'create',
      });
      
      index++;
    }

    // If no code blocks found, treat entire response as single file
    if (files.length === 0) {
      files.push({
        path: `${baseName}.ts`,
        content: this.extractCode(response),
        type: 'create',
      });
    }

    return files;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
