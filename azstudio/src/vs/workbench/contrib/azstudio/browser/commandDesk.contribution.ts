/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize2 } from '../../../../nls.js';
import { MenuRegistry, MenuId, Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ViewContainerLocation, IViewContainersRegistry, Extensions as ViewContainerExtensions, ViewContainer } from '../../../common/views.js';
import { IViewsRegistry, Extensions as ViewExtensions } from '../../../common/views.js';
import { IViewDescriptorService, ViewDescriptorService } from '../../../services/views/browser/viewDescriptorService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ICommandDeskService, CommandDeskService } from './commandDeskService.js';
import { ICommandDeskView, CommandDeskView } from './commandDeskView.js';
import { Codicon } from '../../../../base/common/codicons.js';

// Command Desk View Container
const commandDeskViewContainer = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
	id: 'commandDesk',
	title: localize2('commandDesk.title', 'Command Desk'),
	icon: Codicon.settingsGear,
	ctorDescriptor: new SyncDescriptor(CommandDeskView, []),
	order: 1,
	hideIfEmpty: false,
}, ViewContainerLocation.Sidebar, { doNotRegisterOpenCommand: true });

// Register Command Desk Service
Registry.as('workbench.contributions.workbench').registerWorkbenchContribution(CommandDeskService, 3 /* LifecyclePhase.Restored */);

// Register Command Desk View
const viewsRegistry = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry);
viewsRegistry.registerViews([{
	id: 'commandDesk',
	name: localize2('commandDesk.view.title', 'Command Desk'),
	ctorDescriptor: new SyncDescriptor(CommandDeskView),
	canToggleVisibility: false,
	canMoveView: true,
	order: 1
}], commandDeskViewContainer);

// Register Command Desk Actions
registerAction2(class FocusCommandDeskAction extends Action2 {
	constructor() {
		super({
			id: 'workbench.view.focus.commandDesk',
			title: localize2('focusCommandDesk', 'Focus Command Desk View'),
			category: Categories.View,
			f1: true,
			icon: Codicon.settingsGear
		});
	}

	async run(accessor: any) {
		const viewDescriptorService = accessor.get(IViewDescriptorService);
		const layoutService = accessor.get('layoutService');
		
		const container = viewDescriptorService.getViewContainerById('commandDesk');
		if (container) {
			const paneComposite = layoutService.getPaneComposite(container.id);
			if (paneComposite) {
				paneComposite.focus();
			}
		}
	}
});

registerAction2(class ToggleCommandDeskAction extends Action2 {
	constructor() {
		super({
			id: 'workbench.action.toggleCommandDesk',
			title: localize2('toggleCommandDesk', 'Toggle Command Desk'),
			category: Categories.View,
			f1: true,
			icon: Codicon.settingsGear
		});
	}

	async run(accessor: any) {
		const viewDescriptorService = accessor.get(IViewDescriptorService);
		const layoutService = accessor.get('layoutService');
		
		const container = viewDescriptorService.getViewContainerById('commandDesk');
		if (container) {
			const paneComposite = layoutService.getPaneComposite(container.id);
			if (paneComposite) {
				paneComposite.toggleVisibility();
			}
		}
	}
});

// Command Desk Menu Items
MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
	group: 'navigation',
	order: 1,
	command: {
		id: 'workbench.action.toggleCommandDesk',
		title: localize2('toggleCommandDesk', 'Toggle Command Desk'),
		icon: Codicon.settingsGear
	}
});

MenuRegistry.appendMenuItem(MenuId.ViewContainerTitleContext, {
	group: 'navigation',
	order: 1,
	command: {
		id: 'workbench.action.toggleCommandDesk',
		title: localize2('toggleCommandDesk', 'Toggle Command Desk'),
		icon: Codicon.settingsGear
	},
	when: ContextKeyExpr.equals('viewContainer', 'commandDesk')
});

// Register Command Desk Service
registerAction2(class NewChatSessionAction extends Action2 {
	constructor() {
		super({
			id: 'commandDesk.newChatSession',
			title: localize2('newChatSession', 'New Chat Session'),
			category: Categories.View,
			f1: true,
			icon: Codicon.add
		});
	}

	async run(accessor: any) {
		const commandDeskService = accessor.get(ICommandDeskService);
		commandDeskService.createNewChatSession();
	}
});

registerAction2(class CreateAgentTaskAction extends Action2 {
	constructor() {
		super({
			id: 'commandDesk.createAgentTask',
			title: localize2('createAgentTask', 'Create Agent Task'),
			category: Categories.View,
			f1: true,
			icon: Codicon.listSelection
		});
	}

	async run(accessor: any) {
		const commandDeskService = accessor.get(ICommandDeskService);
		commandDeskService.createAgentTask();
	}
});

registerAction2(class SearchKnowledgeAction extends Action2 {
	constructor() {
		super({
			id: 'commandDesk.searchKnowledge',
			title: localize2('searchKnowledge', 'Search Knowledge Ocean'),
			category: Categories.View,
			f1: true,
			icon: Codicon.search
		});
	}

	async run(accessor: any) {
		const commandDeskService = accessor.get(ICommandDeskService);
		commandDeskService.searchKnowledge();
	}
});

registerAction2(class BuildProjectAction extends Action2 {
	constructor() {
		super({
			id: 'commandDesk.buildProject',
			title: localize2('buildProject', 'Build Project'),
			category: Categories.View,
			f1: true,
			icon: Codicon.rocket
		});
	}

	async run(accessor: any) {
		const commandDeskService = accessor.get(ICommandDeskService);
		commandDeskService.buildProject();
	}
});
