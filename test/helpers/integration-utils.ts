import * as vscode from 'vscode';

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
  timeoutMs = 10000
): Promise<vscode.Diagnostic[]> {
  const existing = vscode.languages.getDiagnostics(uri);
  if (existing.length > 0) {
    return existing;
  }

  return new Promise<vscode.Diagnostic[]>((resolve) => {
    const timer = setTimeout(() => {
      disposable.dispose();
      resolve(vscode.languages.getDiagnostics(uri));
    }, timeoutMs);

    const disposable = vscode.languages.onDidChangeDiagnostics((e) => {
      const match = e.uris.some((u) => u.toString() === uri.toString());
      if (!match) return;
      const diags = vscode.languages.getDiagnostics(uri);
      if (diags.length > 0) {
        clearTimeout(timer);
        disposable.dispose();
        resolve(diags);
      }
    });
  });
}

export async function waitForNoDiagnostics(
  uri: vscode.Uri,
  timeoutMs = 3000
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
