import * as assert from 'assert';
import * as vscode from 'vscode';
import { createUniqueGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('DefinitionProvider', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('go-to-definition jumps from a reference to its declaration', async () => {
    const content = ['SetVar $counter = 0', 'Goto Cue $counter'].join('\n');
    const doc = await createUniqueGma2Document(content);
    await sleep(500);

    const locations = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider',
      doc.uri,
      new vscode.Position(1, 12)
    );

    assert.ok(locations && locations.length > 0, 'Should return a definition location');
    assert.strictEqual(
      locations[0].range.start.line,
      0,
      'Definition should point at the declaration line'
    );
  });

  test('go-to-definition is case-insensitive', async () => {
    const content = ['SetVar $counter = 0', 'Goto Cue $COUNTER'].join('\n');
    const doc = await createUniqueGma2Document(content);
    await sleep(500);

    const locations = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider',
      doc.uri,
      new vscode.Position(1, 12)
    );

    assert.ok(locations && locations.length > 0, 'Should resolve regardless of case');
    assert.strictEqual(locations[0].range.start.line, 0);
  });

  test('returns no definition for an undeclared variable', async () => {
    const doc = await createUniqueGma2Document('Goto Cue $undeclared');
    await sleep(500);

    const locations = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeDefinitionProvider',
      doc.uri,
      new vscode.Position(0, 12)
    );

    assert.ok(!locations || locations.length === 0, 'Should return no definition');
  });
});
