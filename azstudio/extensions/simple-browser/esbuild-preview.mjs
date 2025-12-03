/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from '../esbuild-webview-common.mjs';
import fse from 'fs-extra';

const scriptDir = (typeof import.meta !== 'undefined' && typeof import.meta.dirname !== 'undefined') ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(scriptDir, 'preview-src');
const outDir = path.join(scriptDir, 'media');

run({
	entryPoints: {
		'index': path.join(srcDir, 'index.ts'),
		'codicon': (() => {
			const local = path.join(scriptDir, 'node_modules', '@vscode', 'codicons', 'dist', 'codicon.css');
			const root = path.join(scriptDir, '..', '..', '..', 'node_modules', '@vscode', 'codicons', 'dist', 'codicon.css');
			if (fse.existsSync(local)) return local;
			if (fse.existsSync(root)) return root;
			return local; // fallback to local path; esbuild will error if missing
		})(),
	},
	srcDir,
	outdir: outDir,
	additionalOptions: {
		loader: {
			'.ttf': 'dataurl',
		}
	}
}, process.argv);
