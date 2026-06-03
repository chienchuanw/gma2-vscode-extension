import * as vscode from 'vscode';
import { analysisCache } from './language/analysisCache';
import { keywordDocs } from './keywordDocs';
import { LineType, TokenType } from './language/types';
import type { LineAnalysis } from './language/types';

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

/** Levenshtein edit distance between two strings (brute-force DP, two rows). */
function editDistance(a: string, b: string): number {
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  let current = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1, // deletion
        current[j - 1] + 1, // insertion
        previous[j - 1] + substitutionCost // substitution
      );
    }
    [previous, current] = [current, previous];
  }

  return previous[b.length];
}

/** Edit-distance tolerance scaled to token length, so longer typos get more slack. */
function suggestionThreshold(length: number): number {
  if (length <= 4) {
    return 1;
  }
  if (length <= 7) {
    return 2;
  }
  return 3;
}

/**
 * Suggest the closest known keyword to an unknown token using edit distance.
 * Returns undefined when nothing is within the length-scaled threshold, so
 * unrelated words produce no "did you mean?" noise. With only 304 keywords a
 * brute-force scan is well within budget.
 */
export function findKeywordSuggestion(value: string): string | undefined {
  const lower = value.toLowerCase();
  if (lower.length === 0) {
    return undefined;
  }

  const threshold = suggestionThreshold(lower.length);
  let bestKeyword: string | undefined;
  let bestDistance = Infinity;

  for (const keyword of keywordDocs.keys()) {
    // A length gap alone can already exceed the threshold — skip those cheaply.
    if (Math.abs(keyword.length - lower.length) > threshold) {
      continue;
    }

    const distance = editDistance(lower, keyword);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestKeyword = keyword;
    }
  }

  if (bestKeyword === undefined || bestDistance > threshold) {
    return undefined;
  }

  return keywordDocs.get(bestKeyword)?.name;
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

export function findDuplicateCues(lines: LineAnalysis[]): Array<{
  lineNumber: number;
  cueNumber: string;
  start: number;
  end: number;
  otherLines: number[];
}> {
  const storeCuePattern = /\bStore\s+Cue\s+(\d+(?:\.\d+)?)/i;

  // Pass 1: collect all cue occurrences grouped by cue number
  const cueOccurrences = new Map<string, Array<{ lineNumber: number; start: number; end: number }>>();

  for (const line of lines) {
    const match = line.rawText.match(storeCuePattern);
    if (!match) {
      continue;
    }

    const cueNumber = match[1];
    const cueStart = line.rawText.indexOf(cueNumber, match.index ?? 0);
    const start = cueStart >= 0 ? cueStart : 0;
    const end = start + cueNumber.length;

    if (!cueOccurrences.has(cueNumber)) {
      cueOccurrences.set(cueNumber, []);
    }
    cueOccurrences.get(cueNumber)!.push({ lineNumber: line.lineNumber, start, end });
  }

  // Pass 2: emit results for cue numbers with more than one occurrence
  const results: Array<{
    lineNumber: number;
    cueNumber: string;
    start: number;
    end: number;
    otherLines: number[];
  }> = [];

  for (const [cueNumber, occurrences] of cueOccurrences) {
    if (occurrences.length <= 1) {
      continue;
    }

    for (const occurrence of occurrences) {
      results.push({
        lineNumber: occurrence.lineNumber,
        cueNumber,
        start: occurrence.start,
        end: occurrence.end,
        otherLines: occurrences
          .filter((o) => o.lineNumber !== occurrence.lineNumber)
          .map((o) => o.lineNumber),
      });
    }
  }

  return results;
}

function collectDuplicateCueDiagnostics(
  document: vscode.TextDocument
): vscode.Diagnostic[] {
  const analysis = analysisCache.getOrAnalyze(document);
  const duplicates = findDuplicateCues(analysis.lines);

  return duplicates.map((dup) => {
    const otherLinesDisplay = dup.otherLines.map((l) => l + 1);
    const lineRef =
      otherLinesDisplay.length === 1
        ? `line ${otherLinesDisplay[0]}`
        : `lines ${otherLinesDisplay.join(', ')}`;

    return new vscode.Diagnostic(
      new vscode.Range(dup.lineNumber, dup.start, dup.lineNumber, dup.end),
      `Duplicate cue number "${dup.cueNumber}" (also on ${lineRef})`,
      vscode.DiagnosticSeverity.Information
    );
  });
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

export interface Gma2DiagnosticsConfig {
  unknownKeywords: boolean;
  undefinedVariables: boolean;
  duplicateCues: boolean;
}

/**
 * Assemble diagnostics for a document, honoring per-category toggles. Unclosed
 * string hints are always included; the three categories the user can disable
 * are gated by `config`.
 */
export function collectDiagnostics(
  document: vscode.TextDocument,
  config: Gma2DiagnosticsConfig
): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [...collectHintDiagnostics(document)];

  if (config.unknownKeywords) {
    diagnostics.push(...collectUnknownKeywordDiagnostics(document));
  }
  if (config.undefinedVariables) {
    diagnostics.push(...collectUndefinedVariableDiagnostics(document));
  }
  if (config.duplicateCues) {
    diagnostics.push(...collectDuplicateCueDiagnostics(document));
  }

  return diagnostics;
}

function readDiagnosticsConfig(): Gma2DiagnosticsConfig {
  const config = vscode.workspace.getConfiguration('gma2');
  return {
    unknownKeywords: config.get<boolean>('diagnostics.unknownKeywords', true),
    undefinedVariables: config.get<boolean>('diagnostics.undefinedVariables', true),
    duplicateCues: config.get<boolean>('diagnostics.duplicateCues', true)
  };
}

function updateDiagnostics(
  document: vscode.TextDocument,
  selector: vscode.DocumentSelector,
  collection: vscode.DiagnosticCollection
): void {
  if (vscode.languages.match(selector, document) === 0) {
    return;
  }

  collection.set(document.uri, collectDiagnostics(document, readDiagnosticsConfig()));
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
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration('gma2')) {
        return;
      }
      for (const document of vscode.workspace.textDocuments) {
        updateDiagnostics(document, selector, collection);
      }
    })
  );
}
