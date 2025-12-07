import { IElaraAgentService } from '../../services/azora/common';
// import { registerSingleton, InstantiationType } from '../../platform/instantiation/common/simpleExtensions.js';

// Minimal Inline Chat controller that uses IElaraAgentService
export class AzoraInlineChatController {
  private elaraService: IElaraAgentService;

  constructor(elaraService: IElaraAgentService | any) {
    this.elaraService = elaraService;
  }

  async ask(prompt: string) {
    // Simple passthrough to elara
    return await this.elaraService.invoke(prompt);
  }
}

// Note: This is a minimal controller used for unit tests and local flows. In Phase 2
// it should be registered as a real workbench contribution and integrated with inline chat UI.
