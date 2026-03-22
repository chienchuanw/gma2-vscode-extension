import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  closeAllEditors,
  sleep,
} from '../helpers/integration-utils';

let tmpDir: string;
let fileCounter = 0;

async function createDocAndGetDiagnostics(
  content: string,
  timeoutMs = 10000
): Promise<{ diagnostics: vscode.Diagnostic[]; uri: vscode.Uri }> {
  fileCounter += 1;
  const filePath = path.join(tmpDir, `test-${fileCounter}.gma2`);
  fs.writeFileSync(filePath, content, 'utf-8');

  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length > 0) return { diagnostics, uri };
    await sleep(300);
  }
  return { diagnostics: vscode.languages.getDiagnostics(uri), uri };
}

suite('DiagnosticsProvider', () => {
  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gma2-test-'));
  });

  teardown(async () => {
    await closeAllEditors();
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('reports unknown keyword warning', async () => {
    const { diagnostics } = await createDocAndGetDiagnostics('Storee Cue 1');

    const unknownKw = diagnostics.find((d) =>
      d.message.includes('Unknown keyword')
    );
    assert.ok(unknownKw, `Should report unknown keyword, got: ${diagnostics.map((d) => d.message).join('; ')}`);
    assert.strictEqual(unknownKw!.severity, vscode.DiagnosticSeverity.Warning);
  });

  test('reports undefined variable information', async () => {
    const { diagnostics } = await createDocAndGetDiagnostics('Goto Cue $undeclaredVar');

    const undefinedVar = diagnostics.find((d) =>
      d.message.includes('not declared')
    );
    assert.ok(undefinedVar, `Should report undefined variable, got: ${diagnostics.map((d) => d.message).join('; ')}`);
    assert.strictEqual(
      undefinedVar!.severity,
      vscode.DiagnosticSeverity.Information
    );
  });

  test('reports duplicate cue number', async () => {
    const content = [
      'Store Cue 5 "First"',
      'Store Cue 5 "Duplicate"',
    ].join('\n');

    const { diagnostics } = await createDocAndGetDiagnostics(content);

    const duplicate = diagnostics.find((d) =>
      d.message.includes('Duplicate cue number')
    );
    assert.ok(duplicate, `Should report duplicate cue, got: ${diagnostics.map((d) => d.message).join('; ')}`);
    assert.strictEqual(
      duplicate!.severity,
      vscode.DiagnosticSeverity.Information
    );
  });

  test('reports unclosed string error', async () => {
    const { diagnostics } = await createDocAndGetDiagnostics('Label Cue 1 "Unclosed');

    const unclosed = diagnostics.find((d) =>
      d.message.includes('Unclosed string')
    );
    assert.ok(unclosed, `Should report unclosed string, got: ${diagnostics.map((d) => d.message).join('; ')}`);
    assert.strictEqual(unclosed!.severity, vscode.DiagnosticSeverity.Error);
  });

  test('clean document produces no diagnostics', async () => {
    const content = [
      'SetVar $x = 1',
      'Store Cue 1 "Look"',
      'Goto Cue $x',
    ].join('\n');

    const document = await vscode.workspace.openTextDocument({
      language: 'gma2',
      content,
    });
    await vscode.window.showTextDocument(document);
    await sleep(3000);

    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(
      diagnostics.length,
      0,
      `Expected no diagnostics, got: ${diagnostics.map((d) => d.message).join(', ')}`
    );
  });
});
