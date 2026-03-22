import * as assert from 'assert';
import * as vscode from 'vscode';
import { createGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('DocumentSymbolProvider', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('symbols include section headers as Module kind', async () => {
    const content = [
      '# ---- Cue Programming ----',
      'Store Cue 1 "Look"',
    ].join('\n');

    const doc = await createGma2Document(content);
    await sleep(500);

    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      doc.uri
    );

    assert.ok(symbols, 'Should return symbols');
    const sectionSymbol = symbols.find((s) => s.name === 'Cue Programming');
    assert.ok(sectionSymbol, 'Should include section symbol');
    assert.strictEqual(sectionSymbol!.kind, vscode.SymbolKind.Module);
  });

  test('symbols include variable declarations', async () => {
    const content = [
      'SetVar $counter = 0',
      'Goto Cue $counter',
    ].join('\n');

    const doc = await createGma2Document(content);
    await sleep(500);

    let symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      doc.uri
    );

    if (!symbols || !symbols.some((s) => s.kind === vscode.SymbolKind.Variable)) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await editor.edit((eb) => eb.insert(new vscode.Position(0, 0), ' '));
        await editor.edit((eb) => eb.delete(new vscode.Range(0, 0, 0, 1)));
      }
      await sleep(1000);
      symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        doc.uri
      );
    }

    assert.ok(symbols, 'Should return symbols');
    const hasVariable = symbols.some(
      (s) => s.kind === vscode.SymbolKind.Variable || s.name.includes('counter')
    );
    assert.ok(
      hasVariable,
      `Should include variable symbol, got: ${symbols.map((s) => `${s.name}(kind=${s.kind})`).join(', ')}`
    );
  });
});
