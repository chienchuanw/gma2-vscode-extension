import * as vscode from 'vscode';
import { GMA2HoverProvider } from './hoverProvider';
import { GMA2CompletionProvider } from './completionProvider';
import { GMA2FoldingRangeProvider } from './foldingProvider';
import { setupDiagnostics } from './diagnosticsProvider';
import { GMA2DocumentSymbolProvider } from './symbolProvider';
import {
  GMA2SemanticTokenProvider,
  SEMANTIC_TOKEN_LEGEND
} from './semanticTokenProvider';

export function activate(context: vscode.ExtensionContext): void {
  const selector: vscode.DocumentSelector = { language: 'gma2' };

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(selector, new GMA2HoverProvider()),
    vscode.languages.registerCompletionItemProvider(selector, new GMA2CompletionProvider()),
    vscode.languages.registerFoldingRangeProvider(selector, new GMA2FoldingRangeProvider()),
    vscode.languages.registerDocumentSymbolProvider(selector, new GMA2DocumentSymbolProvider()),
    vscode.languages.registerDocumentSemanticTokensProvider(
      selector,
      new GMA2SemanticTokenProvider(),
      SEMANTIC_TOKEN_LEGEND
    )
  );

  setupDiagnostics(context, selector);
}

export function deactivate(): void {}
