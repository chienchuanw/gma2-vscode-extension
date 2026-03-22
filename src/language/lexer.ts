import { keywordDocs } from '../keywordDocs';
import { Token, TokenType } from './types';

const WHITESPACE_PATTERN = /\s/;
const VARIABLE_START_PATTERN = /[A-Za-z_]/;
const VARIABLE_PART_PATTERN = /[A-Za-z0-9_]/;
const WORD_START_PATTERN = /[A-Za-z_]/;
const WORD_PART_PATTERN = /[A-Za-z0-9_]/;
const DIGIT_PATTERN = /[0-9]/;

function readWhile(text: string, index: number, pattern: RegExp): number {
  let current = index;
  while (current < text.length && pattern.test(text[current])) {
    current += 1;
  }
  return current;
}

export function tokenizeLine(text: string): Token[] {
  if (text.startsWith('#')) {
    return [
      {
        type: TokenType.Comment,
        value: text,
        start: 0,
        end: text.length
      }
    ];
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < text.length) {
    const start = i;
    const ch = text[i];

    if (WHITESPACE_PATTERN.test(ch)) {
      i = readWhile(text, i, WHITESPACE_PATTERN);
      tokens.push({ type: TokenType.Whitespace, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (ch === '#') {
      tokens.push({
        type: TokenType.Comment,
        value: text.slice(start),
        start,
        end: text.length
      });
      break;
    }

    if (ch === '"') {
      i += 1;
      while (i < text.length && text[i] !== '"') {
        i += 1;
      }
      if (i < text.length && text[i] === '"') {
        i += 1;
      }
      tokens.push({ type: TokenType.String, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (
      ch === '$' &&
      i + 1 < text.length &&
      VARIABLE_START_PATTERN.test(text[i + 1])
    ) {
      i += 2;
      while (i < text.length && VARIABLE_PART_PATTERN.test(text[i])) {
        i += 1;
      }
      tokens.push({ type: TokenType.Variable, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (ch === '=' && i + 1 < text.length && text[i + 1] === '=') {
      i += 2;
      tokens.push({ type: TokenType.ComparisonOperator, value: text.slice(start, i), start, end: i });
      continue;
    }

    if ((ch === '>' || ch === '<') && i + 1 < text.length && text[i + 1] === '=') {
      i += 2;
      tokens.push({ type: TokenType.ComparisonOperator, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (ch === '>' || ch === '<') {
      i += 1;
      tokens.push({ type: TokenType.ComparisonOperator, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (ch === '/' && i + 1 < text.length && WORD_START_PATTERN.test(text[i + 1])) {
      i += 2;
      while (i < text.length && WORD_PART_PATTERN.test(text[i])) {
        i += 1;
      }
      tokens.push({ type: TokenType.OptionFlag, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (ch === '[') {
      i += 1;
      tokens.push({ type: TokenType.OpenBracket, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (ch === ']') {
      i += 1;
      tokens.push({ type: TokenType.CloseBracket, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (DIGIT_PATTERN.test(ch)) {
      i += 1;
      while (i < text.length && DIGIT_PATTERN.test(text[i])) {
        i += 1;
      }

      if (
        i + 1 < text.length &&
        text[i] === '.' &&
        DIGIT_PATTERN.test(text[i + 1])
      ) {
        i += 2;
        while (i < text.length && DIGIT_PATTERN.test(text[i])) {
          i += 1;
        }
      }

      tokens.push({ type: TokenType.Number, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === ';' || ch === '@' || ch === '.') {
      i += 1;
      tokens.push({ type: TokenType.Operator, value: text.slice(start, i), start, end: i });
      continue;
    }

    if (WORD_START_PATTERN.test(ch)) {
      i += 1;
      while (i < text.length && WORD_PART_PATTERN.test(text[i])) {
        i += 1;
      }
      const value = text.slice(start, i);
      const lowered = value.toLowerCase();
      const type = keywordDocs.has(lowered) ? TokenType.Keyword : TokenType.Identifier;
      tokens.push({ type, value, start, end: i });
      continue;
    }

    i += 1;
    tokens.push({ type: TokenType.Unknown, value: text.slice(start, i), start, end: i });
  }

  return tokens;
}
