import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export interface InstrumentationConfig {
	enabled?: boolean;
	logPrefix?: string;
}

export interface InstrumentationResult {
	transformedCode: string;
	metadata?: Record<string, any>;
}

export class CodeInstrumentation {
	constructor(private config: InstrumentationConfig = { enabled: true, logPrefix: '' }) {}

	instrument(code: string): InstrumentationResult {
		if (!this.config.enabled) return { transformedCode: code, metadata: {} };

		// Parse with Babel
		const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

		traverse(ast, {
			FunctionDeclaration(path) {
				const name = path.node.id?.name || '<anonymous-fn>';
				const logPrefix = `"${name}"`;
				const logStmt = t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('console'), t.identifier('log')), [t.stringLiteral(`${logPrefix} - enter`)]));
				if (Array.isArray(path.node.body.body)) {
					path.node.body.body.unshift(logStmt);
				}
			},
			ArrowFunctionExpression(path) {
				// For arrow functions with block body
				if (t.isBlockStatement(path.node.body)) {
					const logStmt = t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('console'), t.identifier('log')), [t.stringLiteral('arrow - enter')]));
					path.node.body.body.unshift(logStmt);
				}
			},
			FunctionExpression(path) {
				const logStmt = t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('console'), t.identifier('log')), [t.stringLiteral('function-expression - enter')]));
				if (Array.isArray(path.node.body.body)) {
					path.node.body.body.unshift(logStmt);
				}
			}
		});

		const out = generate(ast, {}, code);
		return { transformedCode: out.code, metadata: { transformed: true } };
	}
}

export default CodeInstrumentation;
