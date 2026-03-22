import * as vscode from 'vscode';
import { analysisCache } from './language/analysisCache';

export class GMA2FoldingRangeProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(
    document: vscode.TextDocument,
    _context: vscode.FoldingContext,
    _token: vscode.CancellationToken
  ): vscode.FoldingRange[] {
    const analysis = analysisCache.getOrAnalyze(document);
    const ranges: vscode.FoldingRange[] = [];

    for (const section of analysis.sections) {
      if (section.endLine > section.startLine) {
        ranges.push(
          new vscode.FoldingRange(
            section.startLine,
            section.endLine,
            vscode.FoldingRangeKind.Region
          )
        );
      }
    }

    return ranges;
  }
}
