import * as assert from 'assert';
import * as vscode from 'vscode';
import { createGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('CompletionProvider', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('completion returns all 304 keywords', async () => {
    const doc = await createGma2Document('');
    await sleep(500);

    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      doc.uri,
      new vscode.Position(0, 0)
    );

    assert.ok(completions, 'Should return completions');
    assert.ok(
      completions.items.length >= 304,
      `Should have at least 304 items, got ${completions.items.length}`
    );
  });

  test('object keywords boosted after function keyword', async () => {
    const doc = await createGma2Document('Store ');
    await sleep(500);

    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      doc.uri,
      new vscode.Position(0, 6)
    );

    assert.ok(completions, 'Should return completions');

    const cueItem = completions.items.find((i) => i.label === 'Cue');
    const storeItem = completions.items.find((i) => i.label === 'Store');
    assert.ok(cueItem, 'Should include Cue');
    assert.ok(storeItem, 'Should include Store');

    const cueSortText = typeof cueItem!.sortText === 'string' ? cueItem!.sortText : '';
    const storeSortText = typeof storeItem!.sortText === 'string' ? storeItem!.sortText : '';
    assert.ok(
      cueSortText < storeSortText,
      `Cue (${cueSortText}) should sort before Store (${storeSortText}) after function keyword`
    );
  });

  test('completion items have documentation', async () => {
    const doc = await createGma2Document('');
    await sleep(500);

    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      'vscode.executeCompletionItemProvider',
      doc.uri,
      new vscode.Position(0, 0)
    );

    const storeItem = completions.items.find((i) => i.label === 'Store');
    assert.ok(storeItem, 'Should include Store');
    assert.ok(storeItem!.detail, 'Should have detail');
    assert.strictEqual(storeItem!.detail, 'function keyword');
  });
});
