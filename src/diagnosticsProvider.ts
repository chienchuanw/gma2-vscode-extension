import * as vscode from 'vscode';
import { analysisCache } from './language/analysisCache';
import { keywordDocs } from './keywordDocs';
import { LineType, TokenType } from './language/types';

function toSeverity(
  severity: 'error' | 'warning' | 'information'
): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'error':
      return vscode.DiagnosticSeverity.Error;
    case 'warning':
      return vscode.DiagnosticSeverity.Warning;
    default:
      return vscode.DiagnosticSeverity.Information;
  }
}

function findKeywordSuggestion(value: string): string | undefined {
  const lower = value.toLowerCase();
  const prefix = lower.slice(0, 2);

  for (const keyword of keywordDocs.keys()) {
    if (prefix.length >= 2 && keyword.startsWith(prefix)) {
      return keywordDocs.get(keyword)?.name;
    }
  }

  return undefined;
}

function collectUnknownKeywordDiagnostics(
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const analysis = analysisCache.getOrAnalyze(document);
  const diagnostics: vscode.Diagnostic[] = [];

  for (const line of analysis.lines) {
    if (line.lineType !== LineType.Command) {
      continue;
    }

    let candidateToken;
    for (const token of line.tokens) {
      if (
        token.type === TokenType.Whitespace ||
        token.type === TokenType.OpenBracket ||
        token.type === TokenType.CloseBracket
      ) {
        continue;
      }

      if (token.type === TokenType.Keyword || token.type === TokenType.Identifier) {
        candidateToken = token;
      }
      break;
    }

    if (!candidateToken || candidateToken.type !== TokenType.Identifier) {
      continue;
    }

    const lower = candidateToken.value.toLowerCase();
    if (keywordDocs.has(lower)) {
      continue;
    }

    const suggestion = findKeywordSuggestion(candidateToken.value);
    const message = suggestion
      ? `Unknown keyword "${candidateToken.value}". Did you mean "${suggestion}"?`
      : `Unknown keyword "${candidateToken.value}"`;

    diagnostics.push(
      new vscode.Diagnostic(
        new vscode.Range(line.lineNumber, candidateToken.start, line.lineNumber, candidateToken.end),
        message,
        vscode.DiagnosticSeverity.Warning
      )
    );
  }

  return diagnostics;
}

function collectUndefinedVariableDiagnostics(
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const analysis = analysisCache.getOrAnalyze(document);
  const diagnostics: vscode.Diagnostic[] = [];

  const declared = new Set<string>();
  for (const variable of analysis.variables) {
    declared.add(variable.name.toLowerCase());
  }

  for (const reference of analysis.variableReferences) {
    if (declared.has(reference.name.toLowerCase())) {
      continue;
    }

    diagnostics.push(
      new vscode.Diagnostic(
        new vscode.Range(reference.line, reference.start, reference.line, reference.end),
        `Variable "${reference.name}" is used but not declared in this file.`,
        vscode.DiagnosticSeverity.Information
      )
    );
  }

  return diagnostics;
}

function collectDuplicateCueDiagnostics(
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const analysis = analysisCache.getOrAnalyze(document);
  const diagnostics: vscode.Diagnostic[] = [];
  const seenCues = new Set<string>();
  const storeCuePattern = /\bStore\s+Cue\s+(\d+(?:\.\d+)?)/i;

  for (const line of analysis.lines) {
    const match = line.rawText.match(storeCuePattern);
    if (!match) {
      continue;
    }

    const cueNumber = match[1];
    if (!seenCues.has(cueNumber)) {
      seenCues.add(cueNumber);
      continue;
    }

    const cueStart = line.rawText.indexOf(cueNumber, match.index ?? 0);
    const start = cueStart >= 0 ? cueStart : 0;
    const end = start + cueNumber.length;

    diagnostics.push(
      new vscode.Diagnostic(
        new vscode.Range(line.lineNumber, start, line.lineNumber, end),
        `Duplicate cue number "${cueNumber}" in Store Cue command.`,
        vscode.DiagnosticSeverity.Information
      )
    );
  }

  return diagnostics;
}

function collectHintDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[] {
  const analysis = analysisCache.getOrAnalyze(document);

  return analysis.diagnosticHints.map(
    (hint) =>
      new vscode.Diagnostic(
        new vscode.Range(hint.line, hint.start, hint.line, hint.end),
        hint.message,
        toSeverity(hint.severity)
      )
  );
}

function updateDiagnostics(
  document: vscode.TextDocument,
  selector: vscode.DocumentSelector,
  collection: vscode.DiagnosticCollection
): void {
  if (vscode.languages.match(selector, document) === 0) {
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [
    ...collectHintDiagnostics(document),
    ...collectUnknownKeywordDiagnostics(document),
    ...collectUndefinedVariableDiagnostics(document),
    ...collectDuplicateCueDiagnostics(document)
  ];

  collection.set(document.uri, diagnostics);
}

export function setupDiagnostics(
  context: vscode.ExtensionContext,
  selector: vscode.DocumentSelector
): void {
  const collection = vscode.languages.createDiagnosticCollection('gma2');
  context.subscriptions.push(collection);

  for (const document of vscode.workspace.textDocuments) {
    updateDiagnostics(document, selector, collection);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      updateDiagnostics(document, selector, collection);
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      updateDiagnostics(event.document, selector, collection);
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      collection.delete(document.uri);
    })
  );
}
