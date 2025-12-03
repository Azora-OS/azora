import assert from 'assert';
import AICodeCompletion from '../../src/vs/workbench/contrib/azstudio/mainServices/AICodeCompletion.ts';
import { Position } from '../../src/vs/workbench/contrib/azstudio/mainServices/AICodeCompletion.ts';
import { isPremiumEntitled } from '../../src/vs/workbench/contrib/azstudio/browser/premiumGate.ts';

class MockDocument {
    uri = 'file:///tmp/example.ts';
    languageId = 'typescript';
    version = 1;
    private text = `function greet(name: string) {\n  return ` + "`Hello ${name}`" + `;\n}\n\nconst a = greet('Azora');\n`;
    getText() { return this.text; }
    getWordRangeAtPosition(position: Position) { return undefined; }
    lineAt(line: number) { const parts = this.text.split('\n'); return { lineNumber: line, text: parts[line] || '', range: { start: { line, character: 0 }, end: { line, character: (parts[line]||'').length } }, rangeIncludingLineBreak: { start: { line, character: 0 }, end: { line, character: (parts[line]||'').length } }, firstNonWhitespaceCharacterIndex: (parts[line]||'').search(/\S|$/), isEmptyOrWhitespace: (parts[line]||'').trim() === '' }; }
}

export async function runAICompletionTests() {
    console.log('Running AI completions node tests...');
    const prev = process.env.AZSTUDIO_PREMIUM;
    delete process.env.AZSTUDIO_PREMIUM;

    // Without entitlement, expect zero completions
    const ai = new AICodeCompletion();
    const doc = new MockDocument();
    const pos: Position = { line: 2, character: 14 };
    const completionsNoPremium = await ai.getCompletions(doc as any, pos as any, { triggerKind: 1 } as any);
    assert.strictEqual(completionsNoPremium.length, 0, 'Completions should be empty for non-premium users');

    // Force premium to get mock completions
    process.env.AZSTUDIO_PREMIUM = 'true';
    const completionsPremium = await ai.getCompletions(doc as any, pos as any, { triggerKind: 1 } as any);
    assert.ok(completionsPremium.length > 0, 'Completions should be returned when premium is enabled');

    // Revert
    if (prev === undefined) { delete process.env.AZSTUDIO_PREMIUM; } else { process.env.AZSTUDIO_PREMIUM = prev; }

    console.log('AI completions node tests passed');
}

function isMainModule() {
    try { if (typeof require === 'function' && require.main === module) return true; } catch {
        // ignore
    }
    try {
        const m = new URL(import.meta.url);
        const entry = process.argv[1] || '';
        const fileName = entry.replace(/^.*[\/\\]/, '');
        return decodeURI(m.pathname || m.href).endsWith(fileName);
    } catch {
        return false;
    }
}
if (isMainModule()) {
    runAICompletionTests().catch(e => { console.error(e); process.exit(1); });
}
