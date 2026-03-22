import * as assert from 'assert';
import * as vscode from 'vscode';
import { createGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('Extension Activation', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('extension activates on .gma2 file open', async () => {
    await createGma2Document('Store Cue 1 "Test"');
    await sleep(1000);

    const ext = vscode.extensions.getExtension('chienchuanw.gma2-language');
    assert.ok(ext, 'Extension should be present');
    assert.ok(ext!.isActive, 'Extension should be active');
  });

  test('hover provider is functional', async () => {
    const doc = await createGma2Document('Store Cue 1');
    await sleep(500);

    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      doc.uri,
      new vscode.Position(0, 1)
    );
    assert.ok(hovers && hovers.length > 0, 'Hover provider should respond');
  });

  test('completion provider is functional', async () => {
    const doc = await createGma2Document('Sto');
    await sleep(500);

    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      doc.uri,
      new vscode.Position(0, 3)
    );
    assert.ok(
      completions && completions.items.length > 0,
      'Completion provider should respond'
    );
  });
});
