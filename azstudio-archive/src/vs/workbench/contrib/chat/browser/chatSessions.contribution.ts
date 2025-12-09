import { IChatSessionsService } from '../../services/chat/chatSessionsService';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions.js';
// A minimal contribution to expose chat sessions service at startup.
import '../../services/chat/chatSessionsService';

export class ChatSessionsContribution {
  constructor() {
    // nothing for now — service is registered by side-effect
  }
}

new ChatSessionsContribution();
