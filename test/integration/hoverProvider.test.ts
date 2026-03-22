import * as assert from 'assert';
import * as vscode from 'vscode';
import { createGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('HoverProvider', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('hover over function keyword returns documentation', async () => {
    const doc = await createGma2Document('Store Cue 1 "Look"');
    await sleep(500);

    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      doc.uri,
      new vscode.Position(0, 2)
    );

    assert.ok(hovers && hovers.length > 0, 'Should return hover');
    const content = hovers[0].contents[0];
    assert.ok(content, 'Should have content');
    const text = typeof content === 'string' ? content : (content as vscode.MarkdownString).value;
    assert.ok(text.includes('Store'), 'Should contain keyword name');
    assert.ok(text.includes('function keyword'), 'Should contain category');
  });

  test('hover over object keyword returns documentation', async () => {
    const doc = await createGma2Document('Store Cue 1');
    await sleep(500);

    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      doc.uri,
      new vscode.Position(0, 7)
    );

    assert.ok(hovers && hovers.length > 0, 'Should return hover');
    const content = hovers[0].contents[0];
    const text = typeof content === 'string' ? content : (content as vscode.MarkdownString).value;
    assert.ok(text.includes('Cue'), 'Should contain keyword name');
    assert.ok(text.includes('object keyword'), 'Should contain category');
  });

  test('hover over unrecognized word returns nothing', async () => {
    const doc = await createGma2Document('unknownword');
    await sleep(500);

    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      doc.uri,
      new vscode.Position(0, 3)
    );

    assert.ok(!hovers || hovers.length === 0, 'Should not return hover');
  });

  test('hover is case-insensitive', async () => {
    const doc = await createGma2Document('store cue 1');
    await sleep(500);

    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      doc.uri,
      new vscode.Position(0, 2)
    );

    assert.ok(hovers && hovers.length > 0, 'Should return hover for lowercase');
    const content = hovers[0].contents[0];
    const text = typeof content === 'string' ? content : (content as vscode.MarkdownString).value;
    assert.ok(text.includes('Store'), 'Should contain canonical name');
  });
});
