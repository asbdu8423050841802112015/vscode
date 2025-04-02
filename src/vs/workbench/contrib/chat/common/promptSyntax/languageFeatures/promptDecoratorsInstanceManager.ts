/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TextModelPromptDecorator } from './textModelPromptDecorator.js';
import { IEditor } from '../../../../../../editor/common/editorCommon.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { isPromptFile } from '../../../../../../platform/prompts/common/constants.js';
import { Disposable, DisposableMap } from '../../../../../../base/common/lifecycle.js';
import { LifecyclePhase } from '../../../../../services/lifecycle/common/lifecycle.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from '../../../../../common/contributions.js';

/**
 * TODO: @legomushroom - add unit tests
 */

/**
 * Provider for prompt syntax decorators on text models.
 */
class PromptDecoratorsInstanceManager extends Disposable {
	/**
	 * Map of all currently active prompt decorator instances.
	 */
	private readonly decorators: DisposableMap<IEditor, TextModelPromptDecorator> = this._register(new DisposableMap());

	constructor(
		@IEditorService private readonly editorService: IEditorService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super();

		// TODO: @legomushroom - condition on promptFiles enablement

		this.deleteDecorator = this.deleteDecorator.bind(this);

		// TODO: @legomushroom - refactor logic in the listeners into a common utility
		this._register(this.editorService.onDidActiveEditorChange(() => {
			const { activeTextEditorControl } = this.editorService;

			if (activeTextEditorControl === undefined) {
				return;
			}

			const editorModel = activeTextEditorControl.getModel();
			if (!editorModel) {
				return;
			}

			// we support only `text editors` for now so filter out `diff` ones
			if ('modified' in editorModel || 'model' in editorModel) {
				return;
			}

			// enable this on editors of reusable prompt files
			if (isPromptFile(editorModel.uri) === false) {
				return;
			}

			this.handleEditor(activeTextEditorControl);
		}));

		this.editorService.visibleTextEditorControls.forEach((editor) => {
			const editorModel = editor.getModel();
			if (!editorModel) {
				return;
			}

			// we support only `text editors` for now so filter out `diff` ones
			if ('modified' in editorModel || 'model' in editorModel) {
				return;
			}

			// enable this on editors of reusable prompt files
			if (isPromptFile(editorModel.uri) === false) {
				return;
			}

			editorModel.onDidChangeContent((event) => {

			});

			this.handleEditor(editor);
		});
	}

	/**
	 * Initialize the decorators provider for the given editor,
	 * if the model exists and used for a prompt file.
	 */
	private handleEditor(editor: IEditor): this {
		let decorationsProvider = this.decorators.get(editor);

		// if a valid prompt editor exists, nothing to do
		if (decorationsProvider && (decorationsProvider.disposed === false)) {
			return this;
		}

		// if the decorator instance is already disposed, delete it
		if (decorationsProvider?.disposed) {
			this.deleteDecorator(editor);
		}

		// add new prompt editor instance for this editor
		decorationsProvider = this.instantiationService.createInstance(TextModelPromptDecorator, editor);
		this.decorators.set(editor, decorationsProvider);

		// automatically delete a decorator reference when it is disposed
		decorationsProvider.onDispose(this.deleteDecorator.bind(this, editor));

		return this;
	}

	/**
	 * Delete and dispose specified editor reference.
	 */
	private deleteDecorator(editor: IEditor): this {
		this.decorators.deleteAndDispose(editor);

		return this;
	}
}

// register the text model prompt decorators provider as a workbench contribution
Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(PromptDecoratorsInstanceManager, LifecyclePhase.Eventually);
