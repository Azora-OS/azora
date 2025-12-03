/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IConfigurationNode } from '../../../../platform/configuration/common/configurationRegistry.js';

export const azStudioAIConfiguration: IConfigurationNode = {
	id: 'azstudio',
	title: 'AzStudio AI',
	type: 'object',
	properties: {
		'azstudio.ai.primaryProvider': {
			type: 'string',
			enum: ['copilot', 'openai', 'gemini', 'openrouter'],
			default: 'copilot',
			description: 'Primary AI provider for AzStudio Lead Architect',
			scope: 3 // SCOPE_WINDOW
		},
		'azstudio.ai.fallbackChain': {
			type: 'array',
			items: {
				type: 'string',
				enum: ['copilot', 'openai', 'gemini', 'openrouter']
			},
			default: ['openai', 'gemini', 'openrouter'],
			description: 'Fallback providers in order of preference',
			scope: 3
		},
		'azstudio.ai.apiKeys.copilot': {
			type: 'string',
			default: '',
			description: 'GitHub Copilot API key (optional - uses VS Code Copilot extension if available)',
			scope: 1, // SCOPE_APPLICATION
			markdownDescription: 'GitHub Copilot API key. If not provided, AzStudio will attempt to use the VS Code Copilot extension.'
		},
		'azstudio.ai.apiKeys.openai': {
			type: 'string',
			default: '',
			description: 'OpenAI API key',
			scope: 1,
			markdownDescription: 'OpenAI API key. Get one from [OpenAI Platform](https://platform.openai.com/api-keys).'
		},
		'azstudio.ai.apiKeys.gemini': {
			type: 'string',
			default: '',
			description: 'Google Gemini API key',
			scope: 1,
			markdownDescription: 'Google Gemini API key. Get one from [Google AI Studio](https://makersuite.google.com/app/apikey).'
		},
		'azstudio.ai.apiKeys.openrouter': {
			type: 'string',
			default: '',
			description: 'OpenRouter API key',
			scope: 1,
			markdownDescription: 'OpenRouter API key. Get one from [OpenRouter](https://openrouter.ai/keys).'
		},
		'azstudio.ai.models.copilot': {
			type: 'string',
			default: 'gpt-4',
			description: 'Model to use for GitHub Copilot',
			scope: 3
		},
		'azstudio.ai.models.openai': {
			type: 'string',
			default: 'gpt-4',
			description: 'OpenAI model to use',
			enum: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
			scope: 3
		},
		'azstudio.ai.models.gemini': {
			type: 'string',
			default: 'gemini-pro',
			description: 'Google Gemini model to use',
			enum: ['gemini-pro', 'gemini-pro-vision'],
			scope: 3
		},
		'azstudio.ai.models.openrouter': {
			type: 'string',
			default: 'mistral/mistral-7b-instruct',
			description: 'OpenRouter model to use',
			scope: 3
		},
		'azstudio.ai.rateLimits.copilot': {
			type: 'number',
			default: 100,
			description: 'Hourly rate limit for Copilot requests',
			scope: 3
		},
		'azstudio.ai.rateLimits.openai': {
			type: 'number',
			default: 1000,
			description: 'Hourly rate limit for OpenAI requests',
			scope: 3
		},
		'azstudio.ai.rateLimits.gemini': {
			type: 'number',
			default: 500,
			description: 'Hourly rate limit for Gemini requests',
			scope: 3
		},
		'azstudio.ai.rateLimits.openrouter': {
			type: 'number',
			default: 200,
			description: 'Hourly rate limit for OpenRouter requests',
			scope: 3
		},
		'azstudio.ai.enableTelemetry': {
			type: 'boolean',
			default: true,
			description: 'Enable AI usage telemetry',
			scope: 3,
			markdownDescription: 'Help improve AzStudio by sharing anonymous AI usage data. No prompts or responses are sent.'
		},
		'azstudio.ai.cacheResponses': {
			type: 'boolean',
			default: true,
			description: 'Cache AI responses to reduce costs and improve speed',
			scope: 3
		},
		'azstudio.ai.maxCacheSize': {
			type: 'number',
			default: 100,
			description: 'Maximum number of cached responses',
			scope: 3
		}
	}
};
