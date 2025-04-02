/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../../../nls.js';
import { Color } from '../../../../../../../base/common/color.js';
import { PromptAtMention } from '../../codecs/tokens/promptAtMention.js';
import { MarkdownString } from '../../../../../../../base/common/htmlContent.js';
import { chatRequestBorder, chatSlashCommandBackground } from '../../../chatColors.js';
import { registerColor } from '../../../../../../../platform/theme/common/colorUtils.js';
import { badgeForeground } from '../../../../../../../platform/theme/common/colorRegistry.js';
import { IReactiveDecorationOptions, ReactiveDecorationBase } from './reactiveDecorationBase.js';
import { IColorTheme, ICssStyleCollector } from '../../../../../../../platform/theme/common/themeService.js';

/**
 * Decoration CSS class names.
 */
export enum DecorationClassNames {
	atMentionActive = 'prompt-at-mention-active',
	atMentionInactive = 'prompt-at-mention-inactive',
	atMentionInlineActive = 'prompt-at-mention-inline-active',
	atMentionInlineInactive = 'prompt-at-mention-inline-inactive',
}

/**
 * Options of the decorator.
 */
interface IOptions extends Pick<IReactiveDecorationOptions, 'cursorPosition' | 'register'> { }

/**
 * TODO: @legomushroom
 */
export class AtMentionDecorator extends ReactiveDecorationBase<PromptAtMention> {
	constructor(
		token: PromptAtMention,
		options: IOptions,
	) {
		super(token, {
			...options,
			description: 'At Mention decoration',
			hoverMessage: new MarkdownString('At Mention'),
			isWholeLine: false,
			cssClassNames: {
				active: {
					inline: DecorationClassNames.atMentionInlineActive,
					normal: DecorationClassNames.atMentionActive,
				},
				inactive: {
					inline: DecorationClassNames.atMentionInlineInactive,
					normal: DecorationClassNames.atMentionInactive,
				},
			},
		});
	}

	/**
	 * TODO: @legomushroom
	 */
	public static registerCssStyles(
		theme: IColorTheme,
		collector: ICssStyleCollector,
	): void {
		const promptAtMentionForeground = registerColor(
			'chat.prompt.atMentionForeground',
			{ dark: '#40A6FF', light: '#306CA2', hcDark: Color.black, hcLight: badgeForeground },
			localize('chat.prompt.color.at-mention-foreground.description', "The foreground color of a prompt `@mention`."),
		);

		const promptAtMentionForegroundActive = registerColor(
			'chat.prompt.atMentionForeground.active',
			{ dark: '#5DB4FF', light: '#1B4C78', hcDark: Color.black, hcLight: badgeForeground },
			localize('chat.prompt.color.at-mention-foreground.active.description', "The foreground color of a prompt `@mention`."),
		);

		const commonStyles = [
			'border-radius: 3px;',
			'box-sizing: border-box;',
			'padding: 0 4px;',
			'border: 1px solid transparent;',
			`background-color: ${theme.getColor(chatSlashCommandBackground)};`,
		];

		const activeStyles = [
			...commonStyles,
			`border-color: ${theme.getColor(chatRequestBorder)};`,
		];

		const inactiveStyles = [
			...commonStyles,
		];

		const frontMatterHeaderCssSelector = `.monaco-editor .${DecorationClassNames.atMentionActive}`;
		collector.addRule(
			`${frontMatterHeaderCssSelector} { ${activeStyles.join(' ')} }`,
		);

		const frontMatterHeaderInactiveCssSelector = `.monaco-editor .${DecorationClassNames.atMentionInactive}`;
		collector.addRule(
			`${frontMatterHeaderInactiveCssSelector} { ${inactiveStyles.join(' ')} }`,
		);

		const inlineInactiveStyles = [
			`color: ${theme.getColor(promptAtMentionForeground)};`,
		];

		const inlineActiveStyles = [
			`color: ${theme.getColor(promptAtMentionForegroundActive)};`,
		];

		const inlineActiveCssSelector = `.monaco-editor .${DecorationClassNames.atMentionInlineActive}`;
		collector.addRule(
			`${inlineActiveCssSelector} { ${inlineActiveStyles.join(' ')} }`,
		);

		const inlineInactiveCssSelector = `.monaco-editor .${DecorationClassNames.atMentionInlineInactive}`;
		collector.addRule(
			`${inlineInactiveCssSelector} { ${inlineInactiveStyles.join(' ')} }`,
		);
	}
}
