/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerColor } from '../../../../platform/theme/common/colorRegistry.js';
import { IWorkbenchColorTheme, IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
import { ITokenStyle } from '../../../../platform/theme/common/tokenClassificationRegistry.js';
import * as nls from '../../../../nls.js';

// AzStudio Color Theme Definition
export const azstudioDark: IWorkbenchColorTheme = {
	id: 'azstudio-dark',
	label: nls.localize('azstudioDark', 'AzStudio Dark'),
	settingsId: 'AzStudio Dark',
	description: nls.localize('azstudioDarkDescription', 'AzStudio dark theme with cyan and magenta accents'),
	extensionData: undefined,
	type: ColorScheme.DARK,
	tokenColors: [
		{
			name: 'Comments',
			scope: ['comment', 'punctuation.definition.comment'],
			settings: {
				foreground: '#6272A4',
				fontStyle: 'italic'
			}
		},
		{
			name: 'Variables',
			scope: ['variable', 'string constant.other.placeholder'],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Colors',
			scope: ['constant.other.color'],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Invalid',
			scope: ['invalid', 'invalid.illegal'],
			settings: {
				foreground: '#FF5555'
			}
		},
		{
			name: 'Keyword, Storage',
			scope: ['keyword', 'storage.type', 'storage.modifier'],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Operator, Misc',
			scope: [
				'keyword.control',
				'constant.other.color',
				'punctuation',
				'meta.tag',
				'punctuation.definition.tag',
				'string.interpolated.dollar'
			],
			settings: {
				foreground: '#F8F8F2'
			}
		},
		{
			name: 'Tag',
			scope: [
				'entity.name.tag',
				'meta.tag.sgml',
				'markup.deleted.git_gutter'
			],
			settings: {
				foreground: '#FF5555'
			}
		},
		{
			name: 'Function, Special Method',
			scope: [
				'entity.name.function',
				'variable.function',
				'support.function',
				'keyword.other.special-method'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'Level 1, Heading',
			scope: [
				'entity.name.section',
				'declaration.section',
				'entity.name.class',
				'entity.name.type.class',
				'support.type',
				'entity.other.inherited-class'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 2, Method',
			scope: [
				'entity.name.function',
				'meta.method-call',
				'variable.function',
				'support.function'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'Level 3, Attribute',
			scope: [
				'entity.other.attribute-name',
				'markup.inserted.git_gutter'
			],
			settings: {
				foreground: '#F1FA8C'
			}
		},
		{
			name: 'Level 4, Property',
			scope: [
				'variable.other.property',
				'support.type.property-name',
				'support.variable.property'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'Level 5, Identifier',
			scope: [
				'variable.other',
				'support.variable'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 6, Number, Constant',
			scope: [
				'constant.numeric',
				'constant.language',
				'support.constant',
				'constant.character',
				'constant.escape'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Level 7, String',
			scope: [
				'string',
				'punctuation.definition.string',
				'support.variable.misc'
			],
			settings: {
				foreground: '#F1FA8C'
			}
		},
		{
			name: 'Level 8, Embedded Expression',
			scope: [
				'string.interpolated.dollar',
				'string.regexp.character-class',
				'string.regexp constant.character.escape',
				'string.regexp source.ruby.embedded',
				'string.regexp constant.character.escape',
				'string.regexp constant.character.class',
				'string.regexp keyword.control.quantifier.regexp',
				'string.regexp constant.character.escape',
				'string.regexp constant.character.class',
				'string.regexp keyword.control.quantifier.regexp',
				'string.regexp constant.character.escape',
				'string.regexp constant.character.class',
				'string.regexp keyword.control.quantifier.regexp'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Level 9, Tag Attribute',
			scope: [
				'entity.other.attribute-name.class'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 10, CSS ID',
			scope: [
				'source.sass keyword.control'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Level 11, CSS Property',
			scope: [
				'source.css support.type.property-name',
				'source.sass support.type.property-name',
				'source.less support.type.property-name',
				'source.scss support.type.property-name',
				'source.postcss support.type.property-name'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 12, CSS Value',
			scope: [
				'source.css support.constant.property-value',
				'source.sass support.constant.property-value',
				'source.less support.constant.property-value',
				'source.scss support.constant.property-value',
				'source.postcss support.constant.property-value'
			],
			settings: {
				foreground: '#F1FA8C'
			}
		},
		{
			name: 'Level 13, CSS Unit',
			scope: [
				'source.css constant.other.color',
				'source.sass constant.other.color',
				'source.less constant.other.color',
				'source.scss constant.other.color',
				'source.postcss constant.other.color'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Level 14, CSS Function',
			scope: [
				'source.css support.function.misc',
				'source.sass support.function.misc',
				'source.less support.function.misc',
				'source.scss support.function.misc',
				'source.postcss support.function.misc'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'Level 15, CSS Keyword',
			scope: [
				'source.css keyword.control',
				'source.sass keyword.control',
				'source.less keyword.control',
				'source.scss keyword.control',
				'source.postcss keyword.control'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Level 16, CSS Selector',
			scope: [
				'source.css entity.other.attribute-name.class',
				'source.sass entity.other.attribute-name.class',
				'source.less entity.other.attribute-name.class',
				'source.scss entity.other.attribute-name.class',
				'source.postcss entity.other.attribute-name.class'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 17, CSS Pseudo',
			scope: [
				'source.css entity.other.attribute-name.pseudo-class',
				'source.sass entity.other.attribute-name.pseudo-class',
				'source.less entity.other.attribute-name.pseudo-class',
				'source.scss entity.other.attribute-name.pseudo-class',
				'source.postcss entity.other.attribute-name.pseudo-class'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Level 18, CSS Tag',
			scope: [
				'source.css entity.name.tag',
				'source.sass entity.name.tag',
				'source.less entity.name.tag',
				'source.scss entity.name.tag',
				'source.postcss entity.name.tag'
			],
			settings: {
				foreground: '#FF5555'
			}
		},
		{
			name: 'Level 19, Markdown Heading',
			scope: [
				'markdown.heading',
				'markdown.heading entity.name',
				'markdown.heading string'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 20, Markdown List',
			scope: [
				'markdown.list punctuation.definition.list'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'Level 21, Markdown Quote',
			scope: [
				'markdown.quote punctuation.definition.blockquote'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'Level 22, Markdown Link',
			scope: [
				'markdown.markdown.inline.link',
				'markdown.markdown.inline.link string'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 23, Markdown Code',
			scope: [
				'markdown.markdown.inline.code',
				'markdown.markdown.inline.code string'
			],
			settings: {
				foreground: '#F1FA8C'
			}
		},
		{
			name: 'Level 24, Markdown Raw',
			scope: [
				'markdown.markdown.raw.block'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'Level 25, Markdown Title',
			scope: [
				'entity.name.section.markdown'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'Level 26, JSON Key - Level 1',
			scope: [
				'source.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'JSON Key - Level 2',
			scope: [
				'source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'JSON Key - Level 3',
			scope: [
				'source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#F1FA8C'
			}
		},
		{
			name: 'JSON Key - Level 4',
			scope: [
				'source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#BD93F9'
			}
		},
		{
			name: 'JSON Key - Level 5',
			scope: [
				'source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#FF5555'
			}
		},
		{
			name: 'JSON Key - Level 6',
			scope: [
				'source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#8BE9FD'
			}
		},
		{
			name: 'JSON Key - Level 7',
			scope: [
				'source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#50FA7B'
			}
		},
		{
			name: 'JSON Key - Level 8',
			scope: [
				'source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json'
			],
			settings: {
				foreground: '#BD93F9'
			}
		}
	],
	semanticHighlighting: false,
	getColor: (colorId: any, useDefault?: boolean) => undefined,
	defines: (colorId: any) => false,
	getTokenStyleMetadata: (type: string, modifiers: string[], modelLanguage: string): ITokenStyle | undefined => undefined,
	tokenColorMap: []
};

// Register AzStudio theme colors
registerColor('azstudio.background', { dark: '#1E1E2E', light: '#FFFFFF', hcDark: '#000000', hcLight: '#FFFFFF' }, nls.localize('azstudio.background', 'AzStudio background color'));
registerColor('azstudio.foreground', { dark: '#F8F8F2', light: '#000000', hcDark: '#FFFFFF', hcLight: '#000000' }, nls.localize('azstudio.foreground', 'AzStudio foreground color'));
registerColor('azstudio.accent', { dark: '#8BE9FD', light: '#007ACC', hcDark: '#8BE9FD', hcLight: '#007ACC' }, nls.localize('azstudio.accent', 'AzStudio accent color'));
registerColor('azstudio.accent2', { dark: '#BD93F9', light: '#007ACC', hcDark: '#BD93F9', hcLight: '#007ACC' }, nls.localize('azstudio.accent2', 'AzStudio secondary accent color'));
registerColor('azstudio.accent3', { dark: '#50FA7B', light: '#007ACC', hcDark: '#50FA7B', hcLight: '#007ACC' }, nls.localize('azstudio.accent3', 'AzStudio tertiary accent color'));

export function registerAzStudioThemes(themeService: IWorkbenchThemeService) {
	// Register the theme with the theme service
	// Note: The actual theme registration happens through the extension system
	// This function is for setting up theme-related services
}
