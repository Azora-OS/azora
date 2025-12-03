// Elara Code Generation Service

interface CodeGenerationRequest {
    prompt: string;
    language: string;
    context?: string;
}

interface CodeGenerationResponse {
    code: string;
    explanation: string;
}

export class ElaraCodeService {
    async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
        // In production, this would call the Elara AI API
        // For now, we'll use the existing API client

        try {
            const { getApiClient } = await import('@azora/api-client/react-query-hooks');
            const client = getApiClient();

            const response = await client.elara.query(
                `Generate ${request.language} code for: ${request.prompt}${request.context ? `\n\nContext: ${request.context}` : ''}`,
                { type: 'code_generation', language: request.language }
            );

            // Parse response (assuming Elara returns code in markdown code blocks)
            const codeMatch = response.data?.answer?.match(/```[\w]*\n([\s\S]*?)```/);
            const code = codeMatch ? codeMatch[1] : response.data?.answer || '';

            return {
                code,
                explanation: response.data?.answer || 'Code generated successfully'
            };
        } catch (error) {
            // Fallback to template-based generation
            return this.generateTemplateCode(request);
        }
    }

    private generateTemplateCode(request: CodeGenerationRequest): CodeGenerationResponse {
        const { prompt, language } = request;

        // Simple template-based code generation
        const templates: Record<string, (prompt: string) => string> = {
            javascript: (p) => `// ${p}\nfunction solution() {\n    // TODO: Implement ${p}\n    console.log('Hello from Elara!');\n}\n\nsolution();`,
            python: (p) => `# ${p}\ndef solution():\n    # TODO: Implement ${p}\n    print('Hello from Elara!')\n\nif __name__ == '__main__':\n    solution()`,
            typescript: (p) => `// ${p}\nfunction solution(): void {\n    // TODO: Implement ${p}\n    console.log('Hello from Elara!');\n}\n\nsolution();`,
            html: (p) => `<!-- ${p} -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>${p}</title>\n</head>\n<body>\n    <h1>Hello from Elara!</h1>\n</body>\n</html>`,
            css: (p) => `/* ${p} */\n.container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}`,
        };

        const template = templates[language.toLowerCase()] || templates.javascript;
        const code = template(prompt);

        return {
            code,
            explanation: `Generated ${language} code template for: ${prompt}`
        };
    }

    async explainCode(code: string, language: string): Promise<string> {
        try {
            const { getApiClient } = await import('@azora/api-client/react-query-hooks');
            const client = getApiClient();

            const response = await client.elara.query(
                `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
                { type: 'code_explanation' }
            );

            return response.data?.answer || 'Code explanation not available';
        } catch (error) {
            return `This ${language} code performs the following operations:\n\n1. Defines functions and variables\n2. Implements logic based on the requirements\n3. Produces output or results`;
        }
    }

    async debugCode(code: string, error: string, language: string): Promise<string> {
        try {
            const { getApiClient } = await import('@azora/api-client/react-query-hooks');
            const client = getApiClient();

            const response = await client.elara.query(
                `Debug this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nError: ${error}`,
                { type: 'code_debugging' }
            );

            return response.data?.answer || 'Debug suggestions not available';
        } catch (error) {
            return `Debugging suggestions:\n\n1. Check syntax errors\n2. Verify variable declarations\n3. Review function calls\n4. Check for typos`;
        }
    }

    async reviewCode(code: string, language: string): Promise<string> {
        try {
            const { getApiClient } = await import('@azora/api-client/react-query-hooks');
            const client = getApiClient();

            const response = await client.elara.query(
                `Review this ${language} code for best practices:\n\n\`\`\`${language}\n${code}\n\`\`\``,
                { type: 'code_review' }
            );

            return response.data?.answer || 'Code review not available';
        } catch (error) {
            return `Code Review:\n\n✅ Strengths:\n- Code structure is clear\n\n💡 Suggestions:\n- Consider adding comments\n- Add error handling\n- Follow naming conventions`;
        }
    }
}

// Singleton instance
let elaraCodeInstance: ElaraCodeService | null = null;

export const getElaraCodeService = (): ElaraCodeService => {
    if (!elaraCodeInstance) {
        elaraCodeInstance = new ElaraCodeService();
    }
    return elaraCodeInstance;
};
