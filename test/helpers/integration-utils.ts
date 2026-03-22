import * as vscode from 'vscode';
import * as path from 'path';

const EXTENSION_ID = 'chienchuanw.gma2-language';

export async function activateExtension(): Promise<vscode.Extension<unknown>> {
  const ext = vscode.extensions.getExtension(EXTENSION_ID);
  if (!ext) {
    throw new Error(`Extension ${EXTENSION_ID} not found`);
  }
  if (!ext.isActive) {
    await ext.activate();
  }
  return ext;
}

export async function openGma2Document(
  fixtureName: string
): Promise<vscode.TextDocument> {
  const fixturesDir = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
  const uri = vscode.Uri.file(path.join(fixturesDir, fixtureName));
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  return document;
}

export async function createGma2Document(
  content: string
): Promise<vscode.TextDocument> {
  const document = await vscode.workspace.openTextDocument({
    language: 'gma2',
    content,
  });
  await vscode.window.showTextDocument(document);
  return document;
}

export async function waitForDiagnostics(
  uri: vscode.Uri,
  timeoutMs = 5000
): Promise<vscode.Diagnostic[]> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length > 0) {
      return diagnostics;
    }
    await sleep(100);
  }
  return vscode.languages.getDiagnostics(uri);
}

export async function waitForNoDiagnostics(
  uri: vscode.Uri,
  timeoutMs = 2000
): Promise<vscode.Diagnostic[]> {
  await sleep(timeoutMs);
  return vscode.languages.getDiagnostics(uri);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function closeAllEditors(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}
