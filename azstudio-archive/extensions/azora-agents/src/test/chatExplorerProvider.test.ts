import { ChatExplorerProvider } from '../chatExplorerProvider';
import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';
import { SankofaService } from '../../../src/vs/workbench/services/azora/sankofaService';
import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';

describe('ChatExplorerProvider', () => {
  it('should list chat agents', async () => {
    const registry = getAzoraAgentRegistry();
    if ((registry as any).clear) (registry as any).clear();
    new ElaraService();
    new SankofaService();
    // Ensure the chat bridge is loaded
    require('../../../src/vs/workbench/contrib/azora/browser/chatBridgeContribution');

    const provider = new ChatExplorerProvider();
    const children = await provider.getChildren();
    expect(children.length).toBeGreaterThanOrEqual(2);
    const texts = children.map(c => c.label as string);
    expect(texts.some(t => t.includes('elara'))).toBeTruthy();
    expect(texts.some(t => t.includes('sankofa'))).toBeTruthy();
  });
});
