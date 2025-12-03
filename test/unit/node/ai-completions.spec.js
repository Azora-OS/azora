const assert = require('assert');
const path = require('path');

describe('AzStudio AI Completions (compiled out)', function() {
  it('should return zero completions by default when not premium', async function() {
    const prodRoot = path.resolve(__dirname, '../../../out');
    const AICodeCompletion = require(prodRoot + '/vs/workbench/contrib/azstudio/mainServices/AICodeCompletion.js');
    // instantiate and run
    const ai = new AICodeCompletion();
    const doc = {
      uri: 'file:///tmp/example.ts',
      languageId: 'typescript',
      version: 1,
      getText() { return `function greet(name: string) {\n  return ` + "`Hello ${name}`" + `;\n}\n\nconst a = greet('Azora');\n`; },
      lineAt(l) { return { lineNumber: l, text: this.getText().split('\n')[l] || '' }; }
    };
    delete process.env.AZSTUDIO_PREMIUM;
    const completions = await ai.getCompletions(doc, { line: 2, character: 14 }, { triggerKind: 1 });
    assert.strictEqual(completions.length, 0);
  });
});
