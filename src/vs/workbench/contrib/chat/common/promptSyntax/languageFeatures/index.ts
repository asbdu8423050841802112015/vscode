/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PromptLinkProvider } from './promptLinkProvider.js';
import { isWindows } from '../../../../../../base/common/platform.js';
import { PromptPathAutocompletion } from './promptPathAutocompletion.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { LifecyclePhase } from '../../../../../services/lifecycle/common/lifecycle.js';
import { PromptDecoratorsInstanceManager } from './promptDecoratorsInstanceManager.js';
import { PromptLinkDiagnosticsInstanceManager } from './promptLinkDiagnosticsProvider.js';
import { BrandedService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution, IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from '../../../../../common/contributions.js';

/**
 * Register all language features for reusable prompts.
 */
export const registerReusablePromptLanguageFeatures = () => {
	registerContribution(PromptLinkProvider);
	registerContribution(PromptDecoratorsInstanceManager);
	registerContribution(PromptLinkDiagnosticsInstanceManager);

	/**
	 * We restrict this provider to `Unix` machines for now because of
	 * the filesystem paths differences on `Windows` operating system.
	 *
	 * Notes on `Windows` support:
	 * 	- we add the `./` for the first path component, which may not work on `Windows`
	 * 	- the first path component of the absolute paths must be a drive letter
	 */
	if (isWindows === false) {
		registerContribution(PromptPathAutocompletion);
	}
};

/**
 * Register a specific prompt language feature contribution.
 */
const registerContribution = <TServices extends BrandedService[]>(
	contribution: new (...services: TServices) => IWorkbenchContribution,
) => {
	Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
		.registerWorkbenchContribution(contribution, LifecyclePhase.Eventually);
};
