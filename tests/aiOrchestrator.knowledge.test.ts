import { AIOrchestrator } from '../azstudio/src/main/services/AIOrchestrator';
import KnowledgeOceanService from '../azstudio/src/vs/workbench/services/azora/knowledgeOceanService';

describe('AIOrchestrator Knowledge Ocean integration', () => {
  it('should return knowledge ocean short answers and include provenance', async () => {
    const orchestrator = new AIOrchestrator();
    // stub KnowledgeOceanService.tryAnswer to return a snippet
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'tryAnswer').mockResolvedValue('From Knowledge Ocean (local): Test Doc - snippet content');
    const resp = await orchestrator.generateCode('Some prompt about test doc', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: 'test' });
    expect(resp.content).toContain('From Knowledge Ocean');
    spy.mockRestore();
  });

  it('should include knowledge context in full generation when knowledge ocean returns snippets', async () => {
    const orchestrator = new AIOrchestrator();
    const snippet = [{ id: 'doc1', title: 'Test Doc', snippet: 'A friendly snippet', source: 'local://doc1', score: 0.9 }];
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'querySnippets').mockResolvedValue(snippet as any);
    // stub actual LLM generation to return a content string that includes the snippet
    let capturedPrompt = '';
    // @ts-ignore override private
    orchestrator.generateWithOpenAI = async (p: string, _model: any) => { capturedPrompt = p; return ({ content: 'Main LLM response: A friendly snippet', model: 'gpt-test', tokensUsed: 10, cost: 0 }); };

    const resp = await orchestrator.generateCode('Prompt that triggers snippet usage', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: 'Prompt that triggers snippet usage' });
    expect(resp.content).toContain('A friendly snippet');
    expect(capturedPrompt).toContain('A friendly snippet');
    spy.mockRestore();
  });

  it('should truncate long knowledge contexts before sending to LLM', async () => {
    const orchestrator = new AIOrchestrator();
    const longSnippet = 'A'.repeat(10000);
    const snippet = [{ id: 'doc1', title: 'Long Doc', snippet: longSnippet, source: 'local://doc1', score: 0.9 }];
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'querySnippets').mockResolvedValue(snippet as any);
    let capturedPrompt = '';
    // @ts-ignore override private
    orchestrator.generateWithOpenAI = async (p: string, _model: any) => { capturedPrompt = p; return ({ content: 'LLM Response', model: 'gpt-test', tokensUsed: 10, cost: 0 }); };
    const resp = await orchestrator.generateCode('Prompt that triggers snippet usage', { files: [], projectInfo: { frameworks: [], conventions: {} }, userPrompt: 'Prompt that triggers snippet usage' });
    expect(resp.content).toContain('LLM Response');
    expect(capturedPrompt).toContain('... (truncated)');
    spy.mockRestore();
  });
});
