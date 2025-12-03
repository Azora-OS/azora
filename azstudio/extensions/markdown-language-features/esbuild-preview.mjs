/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from '../esbuild-webview-common.mjs';

const scriptDir = (typeof import.meta !== 'undefined' && typeof import.meta.dirname !== 'undefined') ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(scriptDir, 'preview-src');
const outDir = path.join(scriptDir, 'media');

run({
	entryPoints: [
		path.join(srcDir, 'index.ts'),
		path.join(srcDir, 'pre'),
	],
	srcDir,
	outdir: outDir,
}, process.argv);
