import {
  BlockPair,
  DiagnosticHint,
  DocumentAnalysis,
  LineAnalysis,
  LineType,
  SectionRange,
  Token,
  TokenType,
  VariableInfo,
  VariableReference
} from './types';
import { tokenizeLine } from './lexer';
import { classifyLine } from './lineParser';

function normalizeVariableName(value: string): string {
  return value.startsWith('$') ? value.slice(1) : value;
}

function extractSectionTitle(text: string): string {
  const withoutHash = text.replace(/^#\s*/, '').trim();
  const trimmedLeading = withoutHash.replace(/^[-=_\s]+/, '');
  const trimmedBoth = trimmedLeading.replace(/[-=_\s]+$/, '');
  return trimmedBoth.length > 0 ? trimmedBoth : withoutHash;
}

function isUnclosedString(token: Token): boolean {
  return token.type === TokenType.String && token.value.startsWith('"') && !token.value.endsWith('"');
}

function findLastNonEmptyLine(lines: string[], from: number, to: number): number {
  if (from > to) {
    return to;
  }

  for (let i = to; i >= from; i -= 1) {
    if (lines[i].trim().length > 0) {
      return i;
    }
  }

  return from;
}

function getDeclarationVariableToken(line: LineAnalysis): Token | undefined {
  const keywordIndex = line.tokens.findIndex((token) => token.type === TokenType.Keyword);
  if (keywordIndex === -1) {
    return undefined;
  }

  for (let i = keywordIndex + 1; i < line.tokens.length; i += 1) {
    const token = line.tokens[i];
    if (token.type === TokenType.Variable) {
      return token;
    }
  }

  return undefined;
}

export function analyzeDocument(lines: string[]): DocumentAnalysis {
  const lineAnalyses: LineAnalysis[] = [];
  const blocks: BlockPair[] = [];
  const sections: SectionRange[] = [];
  const variables: VariableInfo[] = [];
  const variableReferences: VariableReference[] = [];
  const diagnosticHints: DiagnosticHint[] = [];

  let currentSectionHeaderLine: number | null = null;
  let currentSectionTitle = '';

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    const rawText = lines[lineNumber];
    const tokens = tokenizeLine(rawText);
    const lineAnalysis = classifyLine(tokens, lineNumber, rawText);
    lineAnalyses.push(lineAnalysis);

    if (lineAnalysis.lineType === LineType.SectionHeader) {
      if (currentSectionHeaderLine !== null) {
        sections.push({
          headerLine: currentSectionHeaderLine,
          startLine: currentSectionHeaderLine,
          endLine: lineNumber - 1,
          title: currentSectionTitle
        });
      }

      currentSectionHeaderLine = lineNumber;
      currentSectionTitle = extractSectionTitle(rawText);
    }

    const declarationVariableToken =
      lineAnalysis.lineType === LineType.VariableDeclaration
        ? getDeclarationVariableToken(lineAnalysis)
        : undefined;

    if (declarationVariableToken) {
      variables.push({
        name: normalizeVariableName(declarationVariableToken.value),
        declarationLine: lineNumber
      });
    }

    for (const token of lineAnalysis.tokens) {
      if (isUnclosedString(token)) {
        diagnosticHints.push({
          line: lineNumber,
          start: token.start,
          end: token.end,
          message: 'Unclosed string literal.',
          severity: 'error'
        });
      }

      if (token.type !== TokenType.Variable) {
        continue;
      }

      if (
        declarationVariableToken &&
        token.start === declarationVariableToken.start &&
        token.end === declarationVariableToken.end
      ) {
        continue;
      }

      variableReferences.push({
        name: normalizeVariableName(token.value),
        line: lineNumber,
        start: token.start,
        end: token.end
      });
    }
  }

  if (currentSectionHeaderLine !== null) {
    const finalSectionEnd = findLastNonEmptyLine(
      lines,
      currentSectionHeaderLine + 1,
      lines.length - 1
    );
    sections.push({
      headerLine: currentSectionHeaderLine,
      startLine: currentSectionHeaderLine,
      endLine: finalSectionEnd,
      title: currentSectionTitle
    });
  }

  return {
    lines: lineAnalyses,
    blocks,
    sections,
    variables,
    variableReferences,
    diagnosticHints
  };
}
