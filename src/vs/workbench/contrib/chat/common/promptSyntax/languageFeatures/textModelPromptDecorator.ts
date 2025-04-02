/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IPromptsService } from '../service/types.js';
import { assert } from '../../../../../../base/common/assert.js';
import { chatSlashCommandBackground } from '../../chatColors.js';
import { PromptAtMention } from '../codecs/tokens/promptAtMention.js';
import { assertDefined } from '../../../../../../base/common/types.js';
import { IEditor } from '../../../../../../editor/common/editorCommon.js';
import { TextModelPromptParser } from '../parsers/textModelPromptParser.js';
import { Position } from '../../../../../../editor/common/core/position.js';
import { BaseToken } from '../../../../../../editor/common/codecs/baseToken.js';
import { AtMentionDecorator } from './textModelPromptDecorator/atMentionDecorator.js';
import { ObservableDisposable } from '../../../../../../base/common/observableDisposable.js';
import { ReactiveDecorationBase } from './textModelPromptDecorator/reactiveDecorationBase.js';
import { FrontMatterDecoration } from './textModelPromptDecorator/frontMatterHeaderDecoration.js';
import { registerThemingParticipant } from '../../../../../../platform/theme/common/themeService.js';
import { FrontMatterHeaderToken } from '../../../../../../editor/common/codecs/markdownExtensionsCodec/tokens/frontMatterHeaderToken.js';

/**
 * TODO: @legomushroom - list
 * - front matter
 *   - dim down header markers
 *   - edit header markers simultaneously
 * - add decorations options configuration settings
 * - add unit tests
 */

/**
 * Decoration CSS class names.
 */
export enum DecorationClassNames {
	/**
	 * CSS class name for `default` prompt syntax decoration.
	 */
	default = 'prompt-decoration',

	/**
	 * CSS class name for `reference` prompt syntax decoration.
	 */
	reference = 'prompt-reference',
}

/**
 * Decoration CSS class name modifiers.
 */
export enum DecorationClassNameModifiers {
	/**
	 * CSS class name for `warning` modifier.
	 */
	warning = 'squiggly-warning',

	/**
	 * CSS class name for `error` modifier.
	 */
	error = 'squiggly-error', // TODO: @legomushroom - use "markers" instead?
}

/**
 * Prompt syntax decorations provider for text models.
 */
export class TextModelPromptDecorator extends ObservableDisposable {
	/**
	 * Associated prompt parser instance.
	 */
	private readonly parser: TextModelPromptParser;

	/**
	 * TODO: @legomushroom
	 */
	private readonly decorations: ReactiveDecorationBase<BaseToken>[] = [];

	constructor(
		private readonly editor: IEditor,
		@IPromptsService promptsService: IPromptsService,
	) {
		super();

		const editorModel = this.editor.getModel();

		// sanity checks on the editor model
		assertDefined(
			editorModel,
			'Editor must have a model.',
		);
		// we support only `text editors` for now so filter out `diff` ones
		assert(
			(('modified' in editorModel) || ('model' in editorModel)) === false,
			'Editor model must be a text model.',
		);

		this.watchCursorPosition();

		this.parser = promptsService.getSyntaxParserFor(editorModel);
		this.parser.onUpdate(this.updateDecorations.bind(this));
		this.parser.onDispose(this.dispose.bind(this));
		this.parser.start();

		this.updateDecorations();
	}

	/**
	 * TODO: @legomushroom
	 */
	private watchCursorPosition(): this {
		let currentCursorPosition = this.editor.getPosition();
		const interval = setInterval(() => {
			const newCursorPosition = this.editor.getPosition();

			if (currentCursorPosition === newCursorPosition) {
				return;
			}

			if ((currentCursorPosition !== null) && (newCursorPosition !== null)) {
				if (currentCursorPosition.equals(newCursorPosition) === true) {
					return;
				}
			}

			currentCursorPosition = newCursorPosition;
			this.updateCursorPosition(currentCursorPosition);
		}, 100);

		this._register({
			dispose: () => {
				clearInterval(interval);
			},
		});

		return this;
	}

	/**
	 * TODO: @legomushroom
	 */
	private updateCursorPosition(
		cursorPosition: Position | null,
	): this {
		for (const decoration of this.decorations) {
			decoration.setCursorPosition(cursorPosition);
		}

		this.editor.changeDecorations((accessor) => {
			for (const decoration of this.decorations) {
				decoration.render(accessor);
			}
		});

		return this;
	}

	/**
	 * Add a decorations for target prompt tokens.
	 */
	private addDecorations(): this {
		this.editor.changeDecorations((accessor) => {
			const { tokens } = this.parser;
			const register = accessor.addDecoration.bind(accessor);

			for (const token of tokens) {
				const cursorPosition = this.editor.getPosition();

				// TODO: @legomushroom - generalize this logic to a token type list
				if (token instanceof FrontMatterHeaderToken) {
					this.decorations.push(
						new FrontMatterDecoration(token, {
							register,
							cursorPosition,
						}),
					);
				}

				if (token instanceof PromptAtMention) {
					this.decorations.push(
						new AtMentionDecorator(token, {
							register,
							cursorPosition,
						}),
					);
				}
			}
		});

		return this;
	}

	/**
	 * TODO: @legomushroom
	 */
	private async updateDecorations(): Promise<this> {
		// TODO: @legomushroom - update existing decorations instead of recreating them every time

		await this.parser.allSettled();

		this.removeAllDecorations();
		this.addDecorations();

		return this;
	}

	/**
	 * Remove all existing decorations.
	 */
	private removeAllDecorations(): this {
		this.editor.changeDecorations((accessor) => {
			for (const decoration of this.decorations) {
				decoration.remove(accessor);
			}

			this.decorations.splice(0);
		});

		return this;
	}

	public override dispose(): void {
		this.removeAllDecorations();
		super.dispose();
	}

	/**
	 * Returns a string representation of this object.
	 */
	public override toString() {
		return `text-model-prompt-decorator:${this.parser.uri.path}`;
	}
}

/**
 * Register CSS styles.
 */
registerThemingParticipant((theme, collector) => {
	const styles = ['border-radius: 3px;'];

	const backgroundColor = theme.getColor(chatSlashCommandBackground);
	if (backgroundColor) {
		styles.push(`background-color: ${backgroundColor};`);
	}

	const defaultCssSelector = `.monaco-editor .${DecorationClassNames.default}`;
	collector.addRule(
		`${defaultCssSelector} { ${styles.join(' ')} }`,
	);

	AtMentionDecorator.registerCssStyles(theme, collector);
	FrontMatterDecoration.registerCssStyles(theme, collector);
});
