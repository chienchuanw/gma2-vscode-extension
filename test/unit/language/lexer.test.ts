import { describe, it, expect } from 'vitest';
import { tokenizeLine } from '../../../src/language/lexer';
import { TokenType } from '../../../src/language/types';

function tokenTypes(text: string): TokenType[] {
  return tokenizeLine(text)
    .filter((t) => t.type !== TokenType.Whitespace)
    .map((t) => t.type);
}

function tokenValues(text: string): string[] {
  return tokenizeLine(text)
    .filter((t) => t.type !== TokenType.Whitespace)
    .map((t) => t.value);
}

describe('tokenizeLine', () => {
  describe('comments', () => {
    it('tokenizes a full-line comment', () => {
      const tokens = tokenizeLine('# This is a comment');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.Comment);
      expect(tokens[0].value).toBe('# This is a comment');
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(19);
    });

    it('tokenizes an inline comment after a command', () => {
      const types = tokenTypes('Go # start playback');
      expect(types).toEqual([TokenType.Keyword, TokenType.Comment]);
    });

    it('tokenizes a comment starting with # mid-line', () => {
      const tokens = tokenizeLine('Go # start playback');
      const comment = tokens.find((t) => t.type === TokenType.Comment);
      expect(comment?.value).toBe('# start playback');
    });
  });

  describe('strings', () => {
    it('tokenizes a closed string literal', () => {
      const tokens = tokenizeLine('Store Cue 1 "Opening Look"');
      const str = tokens.find((t) => t.type === TokenType.String);
      expect(str?.value).toBe('"Opening Look"');
    });

    it('tokenizes an unclosed string literal', () => {
      const tokens = tokenizeLine('Label Cue 1 "Unclosed');
      const str = tokens.find((t) => t.type === TokenType.String);
      expect(str?.type).toBe(TokenType.String);
      expect(str?.value).toBe('"Unclosed');
    });

    it('tokenizes an empty string', () => {
      const tokens = tokenizeLine('Label Cue 1 ""');
      const str = tokens.find((t) => t.type === TokenType.String);
      expect(str?.value).toBe('""');
    });
  });

  describe('variables', () => {
    it('tokenizes a variable reference', () => {
      const tokens = tokenizeLine('Goto Cue $myVar');
      const variable = tokens.find((t) => t.type === TokenType.Variable);
      expect(variable?.value).toBe('$myVar');
    });

    it('tokenizes a variable with underscores', () => {
      const tokens = tokenizeLine('$my_var_2');
      const variable = tokens.find((t) => t.type === TokenType.Variable);
      expect(variable?.value).toBe('$my_var_2');
    });

    it('does not tokenize bare $ as variable', () => {
      const tokens = tokenizeLine('$ ');
      expect(tokens.some((t) => t.type === TokenType.Variable)).toBe(false);
    });
  });

  describe('numbers', () => {
    it('tokenizes an integer', () => {
      const tokens = tokenizeLine('Store Cue 1');
      const num = tokens.find((t) => t.type === TokenType.Number);
      expect(num?.value).toBe('1');
    });

    it('tokenizes a decimal number', () => {
      const tokens = tokenizeLine('Goto Cue 3.5');
      const num = tokens.find((t) => t.type === TokenType.Number);
      expect(num?.value).toBe('3.5');
    });

    it('tokenizes multi-digit numbers', () => {
      const tokens = tokenizeLine('Select Fixture 100');
      const num = tokens.find((t) => t.type === TokenType.Number);
      expect(num?.value).toBe('100');
    });
  });

  describe('keywords', () => {
    it('tokenizes recognized keywords', () => {
      const types = tokenTypes('Store Cue 1');
      expect(types).toContain(TokenType.Keyword);
    });

    it('is case-insensitive for keyword matching', () => {
      const types = tokenTypes('store cue 1');
      expect(types[0]).toBe(TokenType.Keyword);
      expect(types[1]).toBe(TokenType.Keyword);
    });

    it('tokenizes mixed-case keywords', () => {
      const types = tokenTypes('STORE CUE 1');
      expect(types[0]).toBe(TokenType.Keyword);
      expect(types[1]).toBe(TokenType.Keyword);
    });
  });

  describe('identifiers', () => {
    it('tokenizes unrecognized words as identifiers', () => {
      const tokens = tokenizeLine('unknownword');
      const id = tokens.find((t) => t.type === TokenType.Identifier);
      expect(id?.value).toBe('unknownword');
    });
  });

  describe('operators', () => {
    it('tokenizes arithmetic operators', () => {
      const ops = ['+', '-', '*', '/', ';', '@', '.'];
      for (const op of ops) {
        const tokens = tokenizeLine(op);
        expect(tokens[0].type).toBe(TokenType.Operator);
        expect(tokens[0].value).toBe(op);
      }
    });
  });

  describe('comparison operators', () => {
    it('tokenizes ==', () => {
      const tokens = tokenizeLine('==');
      expect(tokens[0].type).toBe(TokenType.ComparisonOperator);
      expect(tokens[0].value).toBe('==');
    });

    it('tokenizes >=', () => {
      const tokens = tokenizeLine('>=');
      expect(tokens[0].type).toBe(TokenType.ComparisonOperator);
    });

    it('tokenizes <=', () => {
      const tokens = tokenizeLine('<=');
      expect(tokens[0].type).toBe(TokenType.ComparisonOperator);
    });

    it('tokenizes bare > and <', () => {
      expect(tokenizeLine('>')[0].type).toBe(TokenType.ComparisonOperator);
      expect(tokenizeLine('<')[0].type).toBe(TokenType.ComparisonOperator);
    });
  });

  describe('option flags', () => {
    it('tokenizes /merge as an option flag', () => {
      const tokens = tokenizeLine('Store Cue 1 /merge');
      const flag = tokens.find((t) => t.type === TokenType.OptionFlag);
      expect(flag?.value).toBe('/merge');
    });

    it('tokenizes /overwrite as an option flag', () => {
      const tokens = tokenizeLine('Copy Cue 1 At Cue 2 /overwrite');
      const flag = tokens.find((t) => t.type === TokenType.OptionFlag);
      expect(flag?.value).toBe('/overwrite');
    });
  });

  describe('brackets', () => {
    it('tokenizes open bracket', () => {
      const tokens = tokenizeLine('[');
      expect(tokens[0].type).toBe(TokenType.OpenBracket);
    });

    it('tokenizes close bracket', () => {
      const tokens = tokenizeLine(']');
      expect(tokens[0].type).toBe(TokenType.CloseBracket);
    });
  });

  describe('whitespace', () => {
    it('tokenizes whitespace between tokens', () => {
      const tokens = tokenizeLine('Store Cue');
      expect(tokens[1].type).toBe(TokenType.Whitespace);
    });

    it('tokenizes multiple spaces', () => {
      const tokens = tokenizeLine('Store   Cue');
      const ws = tokens.find((t) => t.type === TokenType.Whitespace);
      expect(ws?.value).toBe('   ');
    });
  });

  describe('edge cases', () => {
    it('returns empty array for empty string', () => {
      expect(tokenizeLine('')).toEqual([]);
    });

    it('tokenizes whitespace-only line', () => {
      const tokens = tokenizeLine('   ');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.Whitespace);
    });

    it('tokenizes a complex mixed line', () => {
      const types = tokenTypes('[$x == "value"] Store Cue 1 /merge');
      expect(types).toEqual([
        TokenType.OpenBracket,
        TokenType.Variable,
        TokenType.ComparisonOperator,
        TokenType.String,
        TokenType.CloseBracket,
        TokenType.Keyword,
        TokenType.Keyword,
        TokenType.Number,
        TokenType.OptionFlag,
      ]);
    });

    it('preserves correct start/end positions', () => {
      const tokens = tokenizeLine('Store Cue 1');
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(5);
    });

    it('tokenizes unknown characters', () => {
      const tokens = tokenizeLine('~');
      expect(tokens[0].type).toBe(TokenType.Unknown);
    });
  });
});
