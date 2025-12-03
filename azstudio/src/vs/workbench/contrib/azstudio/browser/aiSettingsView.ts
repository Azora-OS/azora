/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IViewPaneService, IViewDescriptorService } from '../../../services/views/browser/viewsService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ViewPane, IViewPaneOptions } from '../../../browser/parts/views/viewPane.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IViewDescriptor } from '../../../common/views.js';
import { IViewsRegistry } from '../../../services/views/common/viewsService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/views.js';
import { AIProviderType } from './aiProviderRouter.js';

export class AISettingsView extends ViewPane {
	private static readonly ID = 'azstudio.aiSettings';

	constructor(
		options: IViewPaneOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IInstantiationService instantiationService: IInstantiationService
	) {
		super(options, keybindingService, contextKeyService, instantiationService);
	}

	protected renderBody(container: HTMLElement): void {
		container.classList.add('azstudio-ai-settings');
		
		// Create settings form
		const form = document.createElement('div');
		form.className = 'ai-settings-form';
		
		// Primary Provider Selection
		const primaryProviderGroup = this.createSettingGroup(form, 'Primary AI Provider');
		const primaryProviderSelect = this.createSelect(
			primaryProviderGroup,
			'Primary Provider',
			['copilot', 'openai', 'gemini', 'openrouter'],
			this.configurationService.getValue('azstudio.ai.primaryProvider') || 'copilot',
			(value) => this.updateSetting('azstudio.ai.primaryProvider', value)
		);
		
		// API Keys
		const apiKeysGroup = this.createSettingGroup(form, 'API Keys');
		this.createInput(
			apiKeysGroup,
			'OpenAI API Key',
			this.configurationService.getValue('azstudio.ai.apiKeys.openai') || '',
			(value) => this.updateSetting('azstudio.ai.apiKeys.openai', value),
			'password'
		);
		
		this.createInput(
			apiKeysGroup,
			'Gemini API Key',
			this.configurationService.getValue('azstudio.ai.apiKeys.gemini') || '',
			(value) => this.updateSetting('azstudio.ai.apiKeys.gemini', value),
			'password'
		);
		
		this.createInput(
			apiKeysGroup,
			'OpenRouter API Key',
			this.configurationService.getValue('azstudio.ai.apiKeys.openrouter') || '',
			(value) => this.updateSetting('azstudio.ai.apiKeys.openrouter', value),
			'password'
		);
		
		// Fallback Chain
		const fallbackGroup = this.createSettingGroup(form, 'Fallback Providers');
		const fallbackProviders = this.configurationService.getValue('azstudio.ai.fallbackChain') || ['openai', 'gemini', 'openrouter'];
		this.createCheckboxList(
			fallbackGroup,
			'Fallback Order',
			['openai', 'gemini', 'openrouter'],
			fallbackProviders,
			(values) => this.updateSetting('azstudio.ai.fallbackChain', values)
		);
		
		// Models
		const modelsGroup = this.createSettingGroup(form, 'Model Configuration');
		this.createInput(
			modelsGroup,
			'OpenAI Model',
			this.configurationService.getValue('azstudio.ai.models.openai') || 'gpt-4',
			(value) => this.updateSetting('azstudio.ai.models.openai', value)
		);
		
		this.createInput(
			modelsGroup,
			'Gemini Model',
			this.configurationService.getValue('azstudio.ai.models.gemini') || 'gemini-pro',
			(value) => this.updateSetting('azstudio.ai.models.gemini', value)
		);
		
		this.createInput(
			modelsGroup,
			'OpenRouter Model',
			this.configurationService.getValue('azstudio.ai.models.openrouter') || 'mistral/mistral-7b-instruct',
			(value) => this.updateSetting('azstudio.ai.models.openrouter', value)
		);
		
		// Advanced Settings
		const advancedGroup = this.createSettingGroup(form, 'Advanced');
		this.createCheckbox(
			advancedGroup,
			'Enable Telemetry',
			this.configurationService.getValue('azstudio.ai.enableTelemetry') !== false,
			(value) => this.updateSetting('azstudio.ai.enableTelemetry', value)
		);
		
		this.createCheckbox(
			advancedGroup,
			'Cache Responses',
			this.configurationService.getValue('azstudio.ai.cacheResponses') !== false,
			(value) => this.updateSetting('azstudio.ai.cacheResponses', value)
		);
		
		this.createInput(
			advancedGroup,
			'Max Cache Size',
			this.configurationService.getValue('azstudio.ai.maxCacheSize') || 100,
			(value) => this.updateSetting('azstudio.ai.maxCacheSize', parseInt(value) || 100),
			'number'
		);
		
		// Test Connection Button
		const testGroup = this.createSettingGroup(form, 'Test Configuration');
		const testButton = document.createElement('button');
		testButton.textContent = 'Test AI Connections';
		testButton.className = 'test-connections-button';
		testButton.onclick = () => this.testConnections();
		testGroup.appendChild(testButton);
		
		container.appendChild(form);
	}
	
	private createSettingGroup(container: HTMLElement, title: string): HTMLElement {
		const group = document.createElement('div');
		group.className = 'setting-group';
		
		const titleElement = document.createElement('h3');
		titleElement.textContent = title;
		titleElement.className = 'setting-group-title';
		group.appendChild(titleElement);
		
		container.appendChild(group);
		return group;
	}
	
	private createSelect(
		container: HTMLElement,
		label: string,
		options: string[],
		value: string,
		onChange: (value: string) => void
	): HTMLSelectElement {
		const labelElement = document.createElement('label');
		labelElement.textContent = label;
		labelElement.className = 'setting-label';
		
		const select = document.createElement('select');
		select.className = 'setting-select';
		
		options.forEach(option => {
			const optionElement = document.createElement('option');
			optionElement.value = option;
			optionElement.textContent = option;
			optionElement.selected = option === value;
			select.appendChild(optionElement);
		});
		
		select.onchange = () => onChange(select.value);
		
		container.appendChild(labelElement);
		container.appendChild(select);
		
		return select;
	}
	
	private createInput(
		container: HTMLElement,
		label: string,
		value: string,
		onChange: (value: string) => void,
		type: string = 'text'
	): HTMLInputElement {
		const labelElement = document.createElement('label');
		labelElement.textContent = label;
		labelElement.className = 'setting-label';
		
		const input = document.createElement('input');
		input.type = type;
		input.value = value;
		input.className = 'setting-input';
		
		input.onchange = () => onChange(input.value);
		
		container.appendChild(labelElement);
		container.appendChild(input);
		
		return input;
	}
	
	private createCheckbox(
		container: HTMLElement,
		label: string,
		checked: boolean,
		onChange: (value: boolean) => void
	): HTMLInputElement {
		const labelElement = document.createElement('label');
		labelElement.textContent = label;
		labelElement.className = 'setting-label';
		
		const input = document.createElement('input');
		input.type = 'checkbox';
		input.checked = checked;
		input.className = 'setting-checkbox';
		
		input.onchange = () => onChange(input.checked);
		
		container.appendChild(input);
		container.appendChild(labelElement);
		
		return input;
	}
	
	private createCheckboxList(
		container: HTMLElement,
		label: string,
		options: string[],
		values: string[],
		onChange: (values: string[]) => void
	): void {
		const labelElement = document.createElement('div');
		labelElement.textContent = label;
		labelElement.className = 'setting-label';
		container.appendChild(labelElement);
		
		const checkboxContainer = document.createElement('div');
		checkboxContainer.className = 'checkbox-list';
		
		options.forEach(option => {
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = option;
			checkbox.checked = values.includes(option);
			checkbox.className = 'setting-checkbox';
			
			const checkboxLabel = document.createElement('label');
			checkboxLabel.textContent = option;
			checkboxLabel.className = 'checkbox-label';
			
			checkbox.onchange = () => {
				const newValues = options.filter(opt => {
					const cb = checkboxContainer.querySelector(`input[value="${opt}"]`) as HTMLInputElement;
					return cb.checked;
				});
				onChange(newValues);
			};
			
			const wrapper = document.createElement('div');
			wrapper.className = 'checkbox-wrapper';
			wrapper.appendChild(checkbox);
			wrapper.appendChild(checkboxLabel);
			
			checkboxContainer.appendChild(wrapper);
		});
		
		container.appendChild(checkboxContainer);
	}
	
	private updateSetting(key: string, value: any): void {
		this.configurationService.updateValue(key, value);
	}
	
	private async testConnections(): Promise<void> {
		// This would test each configured AI provider
		const button = document.querySelector('.test-connections-button') as HTMLButtonElement;
		if (button) {
			button.textContent = 'Testing...';
			button.disabled = true;
		}
		
		try {
			// Test each provider
			const results = await this.testAllProviders();
			
			// Show results
			this.showTestResults(results);
		} finally {
			if (button) {
				button.textContent = 'Test AI Connections';
				button.disabled = false;
			}
		}
	}
	
	private async testAllProviders(): Promise<Record<string, boolean>> {
		// This would actually test the providers
		// For now, return mock results
		return {
			copilot: true,
			openai: false,
			gemini: false,
			openrouter: false
		};
	}
	
	private showTestResults(results: Record<string, boolean>): void {
		const resultsDiv = document.createElement('div');
		resultsDiv.className = 'test-results';
		
		for (const [provider, success] of Object.entries(results)) {
			const result = document.createElement('div');
			result.className = `test-result ${success ? 'success' : 'error'}`;
			result.textContent = `${provider}: ${success ? 'Connected' : 'Failed'}`;
			resultsDiv.appendChild(result);
		}
		
		const container = document.querySelector('.ai-settings-form');
		if (container) {
			container.appendChild(resultsDiv);
			
			// Remove after 5 seconds
			setTimeout(() => {
				resultsDiv.remove();
			}, 5000);
		}
	}
}

// Register the view
const viewsRegistry = Registry.as<IViewsRegistry>(Extensions.ViewsRegistry);

const aiSettingsViewDescriptor: IViewDescriptor = {
	id: AISettingsView.ID,
	name: 'AI Settings',
	ctorDescriptor: { ctor: AISettingsView },
	canToggleVisibility: true,
	canMoveView: true,
	weight: 20,
	order: 5,
	icon: ThemeIcon.fromId('azstudio-icon'),
};

viewsRegistry.registerViews([aiSettingsView], {
	id: 'azstudio',
	name: 'AzStudio',
});
