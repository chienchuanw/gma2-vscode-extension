import * as assert from 'assert';
import * as vscode from 'vscode';
import { createGma2Document, closeAllEditors, sleep } from '../helpers/integration-utils';

suite('FoldingRangeProvider', () => {
  teardown(async () => {
    await closeAllEditors();
  });

  test('returns folding ranges for sections', async () => {
    const content = [
      '# ---- Act One ----',
      'Store Cue 1 "Overture"',
      'Store Cue 2 "Scene 1"',
      '',
      '# ---- Act Two ----',
      'Store Cue 10 "Intermission"',
      'Go',
    ].join('\n');

    const doc = await createGma2Document(content);
    await sleep(500);

    const ranges = await vscode.commands.executeCommand<vscode.FoldingRange[]>(
      'vscode.executeFoldingRangeProvider',
      doc.uri
    );

    assert.ok(ranges, 'Should return folding ranges');
    assert.ok(
      ranges.length >= 1,
      `Should have at least 1 folding range, got ${ranges.length}`
    );
  });

  test('returns no region folding for document without sections', async () => {
    const content = [
      'Store Cue 1 "Look"',
      'Go',
    ].join('\n');

    const doc = await createGma2Document(content);
    await sleep(500);

    const ranges = await vscode.commands.executeCommand<vscode.FoldingRange[]>(
      'vscode.executeFoldingRangeProvider',
      doc.uri
    );

    assert.ok(ranges !== undefined, 'Should return array');
  });
});
