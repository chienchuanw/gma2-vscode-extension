import * as assert from 'assert';
import * as vscode from 'vscode';
import { createGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('SemanticTokenProvider', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('semantic token legend is registered for gma2', async () => {
    const doc = await createGma2Document('SetVar $counter = 0');
    await sleep(500);

    const legend = await vscode.commands.executeCommand<vscode.SemanticTokensLegend>(
      'vscode.provideDocumentSemanticTokensLegend',
      doc.uri
    );

    assert.ok(legend, 'Should have semantic tokens legend');
    assert.ok(
      legend.tokenTypes.includes('variable'),
      `Legend should include variable type, got: ${legend.tokenTypes.join(', ')}`
    );
  });

  test('provides semantic tokens for document with variables', async () => {
    const content = [
      'SetVar $counter = 0',
      'Goto Cue $counter',
    ].join('\n');

    const doc = await createGma2Document(content);
    await sleep(2000);

    const tokens = await vscode.commands.executeCommand<vscode.SemanticTokens | undefined>(
      'vscode.provideDocumentSemanticTokens',
      doc.uri
    );

    assert.ok(tokens !== undefined, 'Should return a semantic tokens object');
  });
});
