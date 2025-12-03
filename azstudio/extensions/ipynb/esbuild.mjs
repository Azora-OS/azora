/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// @ts-check
import path from 'node:path';
import { run } from '../esbuild-webview-common.mjs';
import { fileURLToPath } from 'url';

const scriptDir = (typeof import.meta !== 'undefined' && typeof import.meta.dirname !== 'undefined') ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(scriptDir, 'notebook-src');
const outDir = path.join(scriptDir, 'notebook-out');

run({
	entryPoints: [
		path.join(srcDir, 'cellAttachmentRenderer.ts'),
	],
	srcDir,
	outdir: outDir,
}, process.argv);
