import * as vscode from 'vscode';
import { analysisCache } from './language/analysisCache';

function makeLineRange(
  document: vscode.TextDocument,
  startLine: number,
  endLine: number
): vscode.Range {
  const safeStartLine = Math.max(0, Math.min(startLine, document.lineCount - 1));
  const safeEndLine = Math.max(0, Math.min(endLine, document.lineCount - 1));

  return new vscode.Range(
    new vscode.Position(safeStartLine, 0),
    document.lineAt(safeEndLine).range.end
  );
}

export class GMA2DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const analysis = analysisCache.getOrAnalyze(document);
    const symbols: vscode.DocumentSymbol[] = [];

    for (const section of analysis.sections) {
      const range = makeLineRange(document, section.headerLine, section.endLine);
      symbols.push(
        new vscode.DocumentSymbol(
          section.title,
          'Section',
          vscode.SymbolKind.Module,
          range,
          makeLineRange(document, section.headerLine, section.headerLine)
        )
      );
    }

    for (const block of analysis.blocks) {
      if (block.endLine === null) {
        continue;
      }

      const range = makeLineRange(document, block.startLine, block.endLine);
      symbols.push(
        new vscode.DocumentSymbol(
          'If',
          'Conditional block',
          vscode.SymbolKind.Struct,
          range,
          makeLineRange(document, block.startLine, block.startLine)
        )
      );
    }

    for (const variable of analysis.variables) {
      const range = makeLineRange(document, variable.declarationLine, variable.declarationLine);
      symbols.push(
        new vscode.DocumentSymbol(
          `$${variable.name}`,
          'Variable declaration',
          vscode.SymbolKind.Variable,
          range,
          range
        )
      );
    }

    return symbols;
  }
}
