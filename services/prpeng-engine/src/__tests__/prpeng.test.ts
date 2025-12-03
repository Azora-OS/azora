import { MasterPromptGenerator } from '../master-prompt-generator';
import { TopicAnalyzer } from '../topic-analyzer';
import { PredictionScopeCalculator } from '../prediction-scope-calculator';
import { ResponseParser } from '../response-parser';
import { DEFAULT_CONFIG } from '../index';

describe('PrPEng Engine Core Components', () => {
    const config = DEFAULT_CONFIG;

    describe('TopicAnalyzer', () => {
        const analyzer = new TopicAnalyzer();

        it('should extract main topic from simple query', () => {
            const analysis = analyzer.analyze('What is quantum computing?');
            expect(analysis.mainTopic).toBe('quantum computing');
            expect(analysis.intent).toBe('learning');
        });

        it('should detect complexity', () => {
            const simple = analyzer.analyze('What is 2+2?');
            expect(simple.complexity).toBe('beginner');

            const complex = analyzer.analyze('Optimize neural network architecture');
            expect(complex.complexity).toBe('advanced');
        });
    });

    describe('MasterPromptGenerator', () => {
        const generator = new MasterPromptGenerator(config);
        const analyzer = new TopicAnalyzer();

        it('should generate a valid prompt', () => {
            const query = 'Explain quantum computing';
            const analysis = analyzer.analyze(query);
            const prompt = generator.generate(query, analysis);

            expect(prompt.systemPrompt).toContain('Azora Predictive Engine');
            expect(prompt.userPrompt).toContain(query);
            expect(prompt.expectedFormat).toBe('json');
        });
    });

    describe('PredictionScopeCalculator', () => {
        const calculator = new PredictionScopeCalculator(config);
        const analyzer = new TopicAnalyzer();

        it('should adjust scope based on complexity', () => {
            const simpleAnalysis = analyzer.analyze('What is a cat?');
            const simpleScope = calculator.calculate(simpleAnalysis);

            expect(simpleScope.predictionScope).toBe('wide');

            const complexAnalysis = analyzer.analyze('Optimize quantum gates');
            const complexScope = calculator.calculate(complexAnalysis);

            expect(complexScope.predictionScope).toBe('narrow');
        });
    });

    describe('ResponseParser', () => {
        const parser = new ResponseParser();

        it('should parse valid JSON response', () => {
            const mockResponse = JSON.stringify({
                mainTopic: 'quantum computing',
                predictions: [
                    {
                        question: 'What are qubits?',
                        answer: 'Qubits are...',
                        topic: 'basics',
                        confidence: 0.9
                    }
                ]
            });

            const parsed = parser.parse(mockResponse, 'query', 'topic');
            expect(parsed.predictions).toHaveLength(1);
            expect(parsed.predictions[0].question).toBe('What are qubits?');
        });

        it('should handle markdown code blocks', () => {
            const mockResponse = '```json\n{"predictions": []}\n```';
            const parsed = parser.parse(mockResponse, 'query', 'topic');
            expect(parsed.predictions).toBeDefined();
        });
    });
});
