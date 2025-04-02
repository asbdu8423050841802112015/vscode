/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../../../../nls.js';
import { Color, RGBA } from '../../../../../../../../base/common/color.js';
import { MarkdownString } from '../../../../../../../../base/common/htmlContent.js';
import { IReactiveDecorationOptions, ReactiveDecorationBase } from './reactiveDecorationBase.js';
import { contrastBorder, registerColor } from '../../../../../../../../platform/theme/common/colorRegistry.js';
import { IColorTheme, ICssStyleCollector } from '../../../../../../../../platform/theme/common/themeService.js';
import { FrontMatterHeaderToken } from '../../../../../../../../editor/common/codecs/markdownExtensionsCodec/tokens/frontMatterHeaderToken.js';

/**
 * Decoration CSS class names.
 */
export enum DecorationClassNames {
	/**
	 * TODO: @legomushroom
	 */
	frontMatterHeader = 'prompt-front-matter-header',
	frontMatterHeaderInlineInactive = 'prompt-front-matter-header-inline-inactive',
	frontMatterHeaderInlineActive = 'prompt-front-matter-header-inline-active',
}

/**
 * Options of the decorator.
 */
interface IOptions extends Pick<IReactiveDecorationOptions, 'cursorPosition' | 'register'> { }

/**
 * TODO: @legomushroom
 */
export class FrontMatterDecoration extends ReactiveDecorationBase<FrontMatterHeaderToken> {
	constructor(
		token: FrontMatterHeaderToken,
		options: IOptions,
	) {
		super(token, {
			...options,
			description: 'Front Matter decoration',
			hoverMessage: new MarkdownString('Front Matter header'),
			isWholeLine: true,
			cssClassNames: {
				active: {
					inline: DecorationClassNames.frontMatterHeaderInlineActive,
					normal: DecorationClassNames.frontMatterHeader,
				},
				inactive: {
					inline: DecorationClassNames.frontMatterHeaderInlineInactive,
					normal: DecorationClassNames.frontMatterHeader,
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
		/**
		 * TODO: @legomushroom
		 */
		const frontMatterHeaderBackgroundColor = registerColor(
			'chat.prompt.frontMatterBackground',
			{ dark: new Color(new RGBA(0, 0, 0, 0.20)), light: new Color(new RGBA(0, 0, 0, 0.10)), hcDark: contrastBorder, hcLight: contrastBorder, },
			localize('chat.prompt.frontMatterBackground', "background color of a Front Matter header block."),
		);

		const styles = [];
		styles.push(
			`background-color: ${theme.getColor(frontMatterHeaderBackgroundColor)};`,
		);

		const frontMatterHeaderCssSelector = `.monaco-editor .${DecorationClassNames.frontMatterHeader}`;
		collector.addRule(
			`${frontMatterHeaderCssSelector} { ${styles.join(' ')} }`,
		);

		const inlineInactiveStyles = [];
		inlineInactiveStyles.push('color: var(--vscode-disabledForeground);');

		const inlineActiveStyles = [];
		inlineActiveStyles.push('color: var(--vscode-foreground);');

		const frontMatterHeaderInlineActiveCssSelector = `.monaco-editor .${DecorationClassNames.frontMatterHeaderInlineActive}`;
		collector.addRule(
			`${frontMatterHeaderInlineActiveCssSelector} { ${inlineActiveStyles.join(' ')} }`,
		);

		const frontMatterHeaderInlineInactiveCssSelector = `.monaco-editor .${DecorationClassNames.frontMatterHeaderInlineInactive}`;
		collector.addRule(
			`${frontMatterHeaderInlineInactiveCssSelector} { ${inlineInactiveStyles.join(' ')} }`,
		);
	}
}
