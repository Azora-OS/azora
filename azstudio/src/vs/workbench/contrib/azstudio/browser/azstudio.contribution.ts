/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService, InstantiationType } from '../../../../platform/instantiation/common/instantiation.js';
import { IAzStudioService, AzStudioService } from './azstudioService.js';
import { IAIBuilderService, AIBuilderService } from './aiBuilderService.js';
import { IMultiAgentService, MultiAgentService } from './multiAgentService.js';
import { IKnowledgeOceanService, KnowledgeOceanService } from './knowledgeOceanService.js';
import { IBuildSpacesService, BuildSpacesService } from './buildSpacesService.js';
import { ICommandDeskService, CommandDeskService } from './commandDeskService.js';
import { IAzStudioRulesEngine, AzStudioRulesEngine } from './rules/azStudioRules.js';
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService, InstantiationType } from '../../../../platform/instantiation/common/instantiation.js';
import { IAzStudioService, AzStudioService } from './azstudioService.js';
import { IAIBuilderService, AIBuilderService } from './aiBuilderService.js';
import { IMultiAgentService, MultiAgentService } from './multiAgentService.js';
import { IKnowledgeOceanService, KnowledgeOceanService } from './knowledgeOceanService.js';
import { IBuildSpacesService, BuildSpacesService } from './buildSpacesService.js';
import { ICommandDeskService, CommandDeskService } from './commandDeskService.js';
import { IAzStudioRulesEngine, AzStudioRulesEngine } from './rules/azStudioRules.js';
import { IEnhancedCommandDesk, EnhancedCommandDesk } from './commandDesk/enhancedCommandDesk.js';
import { IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService, InstantiationType } from '../../../../platform/instantiation/common/instantiation.js';
import { IAzStudioService, AzStudioService } from './azstudioService.js';
import { IAIBuilderService, AIBuilderService } from './aiBuilderService.js';
import { IMultiAgentService, MultiAgentService } from './multiAgentService.js';
import { IKnowledgeOceanService, KnowledgeOceanService } from './knowledgeOceanService.js';
import { IBuildSpacesService, BuildSpacesService } from './buildSpacesService.js';
import { ICommandDeskService, CommandDeskService } from './commandDeskService.js';
import { IAzStudioRulesEngine, AzStudioRulesEngine } from './rules/azStudioRules.js';
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService, InstantiationType } from '../../../../platform/instantiation/common/instantiation.js';
import { IAzStudioService, AzStudioService } from './azstudioService.js';
import { IAIBuilderService, AIBuilderService } from './aiBuilderService.js';
import { IMultiAgentService, MultiAgentService } from './multiAgentService.js';
import { IKnowledgeOceanService, KnowledgeOceanService } from './knowledgeOceanService.js';
import { IBuildSpacesService, BuildSpacesService } from './buildSpacesService.js';
import { ICommandDeskService, CommandDeskService } from './commandDeskService.js';
import { IAzStudioRulesEngine, AzStudioRulesEngine } from './rules/azStudioRules.js';
import { IEnhancedCommandDesk, EnhancedCommandDesk } from './commandDesk/enhancedCommandDesk.js';
import { IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
import { registerAzStudioThemes } from './azstudioThemes.contribution.js';
import './commandDesk.css';

import { IAzStudioPlatform, AzStudioPlatform } from './platform/azStudioPlatform.js';
import { IAICodeCompletionService, AICodeCompletionService } from './aiCodeCompletionService.js';
import { EditorEnhancement } from './editorEnhancement.js';
import { InlineAIChatController } from './inlineAIChat.js';
import { registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { ILeadArchitectService, LeadArchitectService } from './leadArchitectService.js';
import { IAIProviderRouter, AIProviderRouter } from './aiProviderRouter.js';
import { IAgentExecutionRuntime, AgentExecutionRuntime } from './agentExecutionRuntime.js';
import { azStudioAIConfiguration } from './aiConfiguration.js';
import { AISettingsView } from './aiSettingsView.js';
import { IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';

// Register AzStudio services
registerSingleton(IAzStudioService, AzStudioService, InstantiationType.Delayed);
registerSingleton(IAIBuilderService, AIBuilderService, InstantiationType.Delayed);
registerSingleton(IMultiAgentService, MultiAgentService, InstantiationType.Delayed);
registerSingleton(IKnowledgeOceanService, KnowledgeOceanService, InstantiationType.Delayed);
registerSingleton(IBuildSpacesService, BuildSpacesService, InstantiationType.Delayed);
registerSingleton(ICommandDeskService, CommandDeskService, InstantiationType.Delayed);
registerSingleton(IAzStudioRulesEngine, AzStudioRulesEngine, InstantiationType.Delayed);
registerSingleton(IEnhancedCommandDesk, EnhancedCommandDesk, InstantiationType.Delayed);
registerSingleton(IAzStudioPlatform, AzStudioPlatform, InstantiationType.Delayed);
registerSingleton(IAICodeCompletionService, AICodeCompletionService, InstantiationType.Delayed);
registerSingleton(ILeadArchitectService, LeadArchitectService, InstantiationType.Delayed);
registerSingleton(IAIProviderRouter, AIProviderRouter, InstantiationType.Delayed);
registerSingleton(IAgentExecutionRuntime, AgentExecutionRuntime, InstantiationType.Delayed);

// Register Editor Contributions
registerEditorContribution(InlineAIChatController.ID, InlineAIChatController);

// Register AI configuration
const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration(azStudioAIConfiguration);

// Register AI Settings View (this will auto-register via the view descriptor in the file)

export class AzStudioContribution implements IWorkbenchContribution {
	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IWorkbenchThemeService themeService: IWorkbenchThemeService
	) {
		// Initialize AzStudio services
		instantiationService.createInstance(AzStudioService);
		instantiationService.createInstance(AIBuilderService);
		instantiationService.createInstance(MultiAgentService);
		instantiationService.createInstance(KnowledgeOceanService);
		instantiationService.createInstance(BuildSpacesService);
		instantiationService.createInstance(CommandDeskService);
		instantiationService.createInstance(AzStudioRulesEngine);
		instantiationService.createInstance(LeadArchitectService);
		instantiationService.createInstance(AIProviderRouter);
		instantiationService.createInstance(AgentExecutionRuntime);
		instantiationService.createInstance(EnhancedCommandDesk);
		instantiationService.createInstance(AzStudioPlatform);
		instantiationService.createInstance(AICodeCompletionService);

		// Initialize Editor Enhancements
		instantiationService.createInstance(EditorEnhancement);

		// Register AzStudio themes
		registerAzStudioThemes(themeService);
	}
}
