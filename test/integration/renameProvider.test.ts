import * as assert from 'assert';
import * as vscode from 'vscode';
import { createUniqueGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('RenameProvider', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('rename edits all declarations and references', async () => {
    const content = ['SetVar $counter = 0', 'AddVar $counter = 1', 'Goto Cue $counter'].join('\n');
    const doc = await createUniqueGma2Document(content);
    await sleep(500);

    const edit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
      'vscode.executeDocumentRenameProvider',
      doc.uri,
      new vscode.Position(2, 12),
      'index'
    );

    assert.ok(edit, 'Should return a workspace edit');
    const edits = edit.get(doc.uri);
    assert.strictEqual(edits.length, 3, 'Should rename all three occurrences');
    for (const e of edits) {
      assert.strictEqual(e.newText, '$index', 'New text should carry the $ prefix');
    }
  });

  test('rename is case-insensitive across mixed-case occurrences', async () => {
    const content = ['SetVar $Counter = 0', 'Goto Cue $counter'].join('\n');
    const doc = await createUniqueGma2Document(content);
    await sleep(500);

    const edit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
      'vscode.executeDocumentRenameProvider',
      doc.uri,
      new vscode.Position(0, 9),
      'index'
    );

    assert.ok(edit);
    const edits = edit.get(doc.uri);
    assert.strictEqual(edits.length, 2, 'Should rename both mixed-case occurrences');
  });

  test('rename of an undeclared variable still edits the reference', async () => {
    const doc = await createUniqueGma2Document('Goto Cue $undeclared');
    await sleep(500);

    const edit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
      'vscode.executeDocumentRenameProvider',
      doc.uri,
      new vscode.Position(0, 12),
      'foo'
    );

    assert.ok(edit);
    const edits = edit.get(doc.uri);
    assert.strictEqual(edits.length, 1);
    assert.strictEqual(edits[0].newText, '$foo');
  });
});
