import * as vscode from 'vscode';

const SECTION_HEADER_PATTERN = /^#\s*[-=_]{3,}/;
const IF_PATTERN = /^\s*If\b/i;
const ENDIF_PATTERN = /^\s*EndIf\b/i;

export class GMA2FoldingRangeProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(
    document: vscode.TextDocument,
    _context: vscode.FoldingContext,
    _token: vscode.CancellationToken
  ): vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];

    this.addSectionFoldingRanges(document, ranges);
    this.addIfEndIfFoldingRanges(document, ranges);

    return ranges;
  }

  private addSectionFoldingRanges(
    document: vscode.TextDocument,
    ranges: vscode.FoldingRange[]
  ): void {
    const sectionStarts: number[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const lineText = document.lineAt(i).text;
      if (SECTION_HEADER_PATTERN.test(lineText)) {
        sectionStarts.push(i);
      }
    }

    for (let i = 0; i < sectionStarts.length; i++) {
      const start = sectionStarts[i];
      const end = i + 1 < sectionStarts.length
        ? sectionStarts[i + 1] - 1
        : this.findLastNonEmptyLine(document, start + 1, document.lineCount - 1);

      if (end > start) {
        ranges.push(new vscode.FoldingRange(start, end, vscode.FoldingRangeKind.Region));
      }
    }
  }

  private addIfEndIfFoldingRanges(
    document: vscode.TextDocument,
    ranges: vscode.FoldingRange[]
  ): void {
    const ifStack: number[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const lineText = document.lineAt(i).text;

      if (IF_PATTERN.test(lineText)) {
        ifStack.push(i);
      } else if (ENDIF_PATTERN.test(lineText)) {
        const matchedIf = ifStack.pop();
        if (matchedIf !== undefined && i > matchedIf) {
          ranges.push(new vscode.FoldingRange(matchedIf, i));
        }
      }
    }
  }

  private findLastNonEmptyLine(
    document: vscode.TextDocument,
    from: number,
    to: number
  ): number {
    for (let i = to; i >= from; i--) {
      if (document.lineAt(i).text.trim().length > 0) {
        return i;
      }
    }
    return from;
  }
}
