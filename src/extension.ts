import * as vscode from 'vscode';
import { GMA2HoverProvider } from './hoverProvider';

export function activate(context: vscode.ExtensionContext): void {
  const hoverProvider = vscode.languages.registerHoverProvider(
    'gma2',
    new GMA2HoverProvider()
  );

  context.subscriptions.push(hoverProvider);
}

export function deactivate(): void {
  // Nothing to clean up
}
