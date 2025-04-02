/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position } from '../../../../../../../../editor/common/core/position.js';
import { IMarkdownString } from '../../../../../../../../base/common/htmlContent.js';
import { BaseToken } from '../../../../../../../../editor/common/codecs/baseToken.js';
import { ModelDecorationOptions } from '../../../../../../../../editor/common/model/textModel.js';
import { ObservableDisposable } from '../../../../../../../../base/common/observableDisposable.js';
import { IModelDecorationsChangeAccessor, TrackedRangeStickiness } from '../../../../../../../../editor/common/model.js';

/**
 * TODO: @legomushroom
 */
interface ICssClassNames {
	readonly inline: string;
	readonly normal: string;
}

/**
 * TODO: @legomushroom
 */
export interface IReactiveDecorationOptions {
	readonly description: string;
	readonly isWholeLine?: boolean;
	readonly hoverMessage?: IMarkdownString | IMarkdownString[];
	readonly cursorPosition: Position | null;

	readonly register: IModelDecorationsChangeAccessor['addDecoration'];

	readonly cssClassNames: {
		readonly active: ICssClassNames;
		readonly inactive: ICssClassNames;
	};
}

/**
 * TODO: @legomushroom
 */
export abstract class ReactiveDecorationBase<TToken extends BaseToken> extends ObservableDisposable {
	/**
	 * TODO: @legomushroom
	 */
	private currentCursorPosition: Position | null = null;

	/**
	 * TODO: @legomushroom
	 */
	private readonly decorationId: string;

	// /**
	//  * TODO: @legomushroom
	//  */
	// private readonly onChangeEmitter = this._register(new Emitter<void>());

	// /**
	//  * TODO: @legomushroom
	//  */
	// private readonly onChangeEvent = this.onChangeEmitter.event;

	/**
	 * TODO: @legomushroom
	 */
	private active: boolean;

	constructor(
		protected readonly token: TToken,
		private readonly options: IReactiveDecorationOptions,
	) {
		super();

		const { cursorPosition, register } = this.options;

		this.currentCursorPosition = cursorPosition;
		this.active = this.isActive;

		this.decorationId = register(
			this.token.range,
			this.decorationOptions,
		);

		// TODO: @legomushroom
		// this._register(
		// 	this.onChange(this.updateDecoration.bind(this)),
		// );
	}

	/**
	 * TODO: @legomushroom
	 */
	private activityStateChanged = false;

	// /**
	//  * TODO: @legomushroom
	//  */
	// public onChange(callback: () => void): this {
	// 	this._register(this.onChangeEvent(callback));

	// 	return this;
	// }

	/**
	 * TODO: @legomushroom
	 */
	public setCursorPosition(position: Position | null): this {
		this.currentCursorPosition = position;

		if (this.isActive !== this.active) {
			this.active = this.isActive;

			this.activityStateChanged = true;
			// this.onChangeEmitter.fire();
		}

		return this;
	}

	/**
	 * TODO: @legomushroom
	 */
	private get isActive(): boolean {
		if (this.currentCursorPosition === null) {
			return false;
		}

		const { range } = this.token;
		return range.containsPosition(this.currentCursorPosition);
	}

	/**
	 * TODO: @legomushroom
	 */
	public render(
		accessor: IModelDecorationsChangeAccessor,
	): this {
		if (this.activityStateChanged === false) {
			return this;
		}

		this.activityStateChanged = false;

		accessor.changeDecorationOptions(
			this.decorationId,
			this.decorationOptions,
		);

		return this;
	}

	/**
	 * TODO: @legomushroom
	 */
	public remove(
		accessor: IModelDecorationsChangeAccessor,
	): this {
		accessor.removeDecoration(this.decorationId);

		return this;
	}

	/**
	 * TODO: @legomushroom
	 */
	private get decorationOptions(): ModelDecorationOptions {
		const classes = (this.isActive)
			? this.options.cssClassNames.active
			: this.options.cssClassNames.inactive;

		return ModelDecorationOptions.createDynamic({
			className: classes.normal,
			inlineClassName: classes.inline,
			description: this.options.description,
			hoverMessage: this.options.hoverMessage,
			isWholeLine: this.options.isWholeLine,
			stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
			shouldFillLineOnLineBreak: true,
		});
	}
}
