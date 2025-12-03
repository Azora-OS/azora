import AICodeCompletion from '../../src/vs/workbench/contrib/azstudio/mainServices/AICodeCompletion.ts';
import { Position } from '../../src/vs/workbench/contrib/azstudio/mainServices/AICodeCompletion.ts';

(async function(){
  process.env.AZSTUDIO_PREMIUM = 'true';
  const ai = new AICodeCompletion();
  const doc: any = {
    uri: 'file:///tmp/example.ts',
    languageId: 'typescript',
    version: 1,
    getText() { return `function greet(name: string) {\n  return ` + "`Hello ${name}`" + `;\n}\n\nconst a = greet('Azora');\n`; },
    getWordRangeAtPosition() { return undefined; },
    lineAt(line: number){ const parts = this.getText().split('\n'); return { lineNumber: line, text: parts[line] || '', range: { start: { line, character: 0 }, end: { line, character: (parts[line]||'').length } }, rangeIncludingLineBreak: { start: { line, character: 0 }, end: { line, character: (parts[line]||'').length } }, firstNonWhitespaceCharacterIndex: (parts[line]||'').search(/\S|$/), isEmptyOrWhitespace: (parts[line]||'').trim() === '' } }
  };
  const pos: Position = { line: 2, character: 14 };
  const completions = await ai.getCompletions(doc as any, pos as any, { triggerKind: 1 } as any);
  console.log('CompletionsCount:', completions.length);
  console.log(completions.slice(0,5));
})();
