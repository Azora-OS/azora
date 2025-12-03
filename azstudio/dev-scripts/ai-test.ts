import AICodeCompletion from '../src/vs/workbench/contrib/azstudio/mainServices/AICodeCompletion.ts';
import { Position } from '../src/vs/workbench/contrib/azstudio/mainServices/AICodeCompletion.ts';
import { isPremiumEntitled } from '../src/vs/workbench/contrib/azstudio/browser/premiumGate.ts';

class MockDocument {
  uri = 'file:///tmp/example.ts';
  languageId = 'typescript';
  version = 1;
  private text = `function greet(name: string) {\n  return \`Hello ${name}\`;\n}\n\nconst a = greet('Azora');\n`;
  getText() { return this.text; }
  getWordRangeAtPosition(position: Position) { return undefined; }
  lineAt(line: number) { const parts = this.text.split('\n'); return { lineNumber: line, text: parts[line] || '', range: { start: { line, character: 0 }, end: { line, character: (parts[line]||'').length } }, rangeIncludingLineBreak: { start: { line, character: 0 }, end: { line, character: (parts[line]||'').length } }, firstNonWhitespaceCharacterIndex: (parts[line]||'').search(/\S|$/), isEmptyOrWhitespace: (parts[line]||'').trim() === '' }; }
}

async function runTest() {
  console.log('AzStudio AI Migration Test: Starting');

  const premium = await isPremiumEntitled();
  console.log(`Detected premium entitlement: ${premium}`);

  const ai = new AICodeCompletion();
  const doc = new MockDocument();
  const pos: Position = { line: 2, character: 14 };

  try {
    const completions = await ai.getCompletions(doc as any, pos as any, { triggerKind: 1 });
    console.log('Completions Count:', completions.length);
    console.log('Completions Preview:');
    console.log(completions.slice(0, 5));
  } catch (e) {
    console.error('Test failed:', e);
    process.exitCode = 1;
  }

}

runTest();
