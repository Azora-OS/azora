export interface AIAnalysisResult {
    score: number;
    suggestions: string[];
    technologies: string[];
}

export interface AzromeAIBridge {
    analyze: (url: string) => Promise<AIAnalysisResult>;
    generateCode: (design: any) => Promise<string>;
}
