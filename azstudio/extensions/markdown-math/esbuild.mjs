/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
//@ts-check

import path from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import { run } from '../esbuild-webview-common.mjs';

const args = process.argv.slice(2);

const scriptDir = (typeof import.meta !== 'undefined' && typeof import.meta.dirname !== 'undefined') ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(scriptDir, 'notebook');
const outDir = path.join(scriptDir, 'notebook-out');

function postBuild(outDir) {
	fse.copySync(
		path.join(scriptDir, 'node_modules', 'katex', 'dist', 'katex.min.css'),
		path.join(outDir, 'katex.min.css'));

	const fontsDir = path.join(scriptDir, 'node_modules', 'katex', 'dist', 'fonts');
	const fontsOutDir = path.join(outDir, 'fonts/');

	fse.mkdirSync(fontsOutDir, { recursive: true });

	for (const file of fse.readdirSync(fontsDir)) {
		if (file.endsWith('.woff2')) {
			fse.copyFileSync(path.join(fontsDir, file), path.join(fontsOutDir, file));
		}
	}
}

run({
	entryPoints: [
		path.join(srcDir, 'katex.ts'),
	],
	srcDir,
	outdir: outDir,
}, process.argv, postBuild);
