// Agent Services Initialization
// This file ensures all Azora agents are registered with the agent registry on startup

import './elaraService'; // azora.elara
import './agents/amaraService'; // azora.amara
import './agents/imaniService'; // azora.imani
import './agents/jabariService'; // azora.jabari
import './agents/kofiService'; // azora.kofi
import './agents/niaService'; // azora.nia
import './agents/thaboService'; // azora.thabo
import './agents/zuriService'; // azora.zuri

// The imports above will instantiate the services and register them with the agent registry
// This ensures the chat system can find and invoke the agents
