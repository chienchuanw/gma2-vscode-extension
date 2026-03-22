import { LineAnalysis, LineType, Token, TokenType } from './types';

const SECTION_HEADER_PATTERN = /^#\s*[-=_]{3,}/;
const VARIABLE_DECLARATION_KEYWORDS = new Set(['setvar', 'setuservar', 'addvar', 'adduservar']);

function getFirstNonWhitespaceToken(tokens: Token[]): Token | undefined {
  return tokens.find((token) => token.type !== TokenType.Whitespace);
}

function getFirstKeywordToken(tokens: Token[]): Token | undefined {
  return tokens.find((token) => token.type === TokenType.Keyword);
}

export function classifyLine(tokens: Token[], lineNumber: number, rawText: string): LineAnalysis {
  const firstNonWhitespaceToken = getFirstNonWhitespaceToken(tokens);

  if (!firstNonWhitespaceToken) {
    return {
      lineNumber,
      lineType: LineType.Empty,
      tokens,
      rawText
    };
  }

  if (firstNonWhitespaceToken.type === TokenType.Comment) {
    return {
      lineNumber,
      lineType: SECTION_HEADER_PATTERN.test(firstNonWhitespaceToken.value)
        ? LineType.SectionHeader
        : LineType.Comment,
      tokens,
      rawText
    };
  }

  const firstKeywordToken = getFirstKeywordToken(tokens);
  if (firstKeywordToken) {
    const keyword = firstKeywordToken.value.toLowerCase();

    if (keyword === 'if') {
      return {
        lineNumber,
        lineType: LineType.ConditionalStart,
        tokens,
        rawText
      };
    }

    if (keyword === 'endif') {
      return {
        lineNumber,
        lineType: LineType.ConditionalEnd,
        tokens,
        rawText
      };
    }

    if (VARIABLE_DECLARATION_KEYWORDS.has(keyword)) {
      return {
        lineNumber,
        lineType: LineType.VariableDeclaration,
        tokens,
        rawText
      };
    }
  }

  if (firstNonWhitespaceToken.type === TokenType.OpenBracket) {
    return {
      lineNumber,
      lineType: LineType.ConditionalStart,
      tokens,
      rawText
    };
  }

  if (tokens.some((token) => token.type === TokenType.Keyword)) {
    return {
      lineNumber,
      lineType: LineType.Command,
      tokens,
      rawText
    };
  }

  return {
    lineNumber,
    lineType: LineType.Other,
    tokens,
    rawText
  };
}
