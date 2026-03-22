import * as vscode from 'vscode';
import { GMA2HoverProvider } from './hoverProvider';
import { GMA2CompletionProvider } from './completionProvider';
import { GMA2FoldingRangeProvider } from './foldingProvider';

export function activate(context: vscode.ExtensionContext): void {
  const selector: vscode.DocumentSelector = { language: 'gma2' };

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(selector, new GMA2HoverProvider()),
    vscode.languages.registerCompletionItemProvider(selector, new GMA2CompletionProvider()),
    vscode.languages.registerFoldingRangeProvider(selector, new GMA2FoldingRangeProvider())
  );
}

export function deactivate(): void {}
