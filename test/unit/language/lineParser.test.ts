import { describe, it, expect } from 'vitest';
import { classifyLine } from '../../../src/language/lineParser';
import { tokenizeLine } from '../../../src/language/lexer';
import { LineType } from '../../../src/language/types';

function classify(text: string, lineNumber = 0): LineType {
  const tokens = tokenizeLine(text);
  return classifyLine(tokens, lineNumber, text).lineType;
}

describe('classifyLine', () => {
  describe('empty lines', () => {
    it('classifies empty string as Empty', () => {
      expect(classify('')).toBe(LineType.Empty);
    });

    it('classifies whitespace-only as Empty', () => {
      expect(classify('   ')).toBe(LineType.Empty);
    });
  });

  describe('comments', () => {
    it('classifies a comment line', () => {
      expect(classify('# a comment')).toBe(LineType.Comment);
    });

    it('classifies a comment with leading whitespace as Comment', () => {
      expect(classify('  # indented comment')).toBe(LineType.Comment);
    });
  });

  describe('section headers', () => {
    it('classifies # ---- pattern as SectionHeader', () => {
      expect(classify('# ---- Section Name ----')).toBe(LineType.SectionHeader);
    });

    it('classifies # ==== pattern as SectionHeader', () => {
      expect(classify('# ==== Section ====')).toBe(LineType.SectionHeader);
    });

    it('classifies # ____ pattern as SectionHeader', () => {
      expect(classify('# ____ Section ____')).toBe(LineType.SectionHeader);
    });

    it('does not classify short separators as SectionHeader', () => {
      expect(classify('# --')).toBe(LineType.Comment);
    });
  });

  describe('commands', () => {
    it('classifies a line with a keyword as Command', () => {
      expect(classify('Store Cue 1')).toBe(LineType.Command);
    });

    it('classifies Go as Command', () => {
      expect(classify('Go')).toBe(LineType.Command);
    });

    it('classifies case-insensitive keywords as Command', () => {
      expect(classify('store cue 1')).toBe(LineType.Command);
    });
  });

  describe('conditional starts', () => {
    it('classifies bracket-start line as ConditionalStart', () => {
      expect(classify('[$x == 1] Go')).toBe(LineType.ConditionalStart);
    });

    it('classifies bare bracket as ConditionalStart', () => {
      expect(classify('[$var >= 5] Store Cue 1')).toBe(
        LineType.ConditionalStart
      );
    });
  });

  describe('variable declarations', () => {
    it('classifies SetVar as VariableDeclaration', () => {
      expect(classify('SetVar $myVar = 1')).toBe(LineType.VariableDeclaration);
    });

    it('classifies SetUserVar as VariableDeclaration', () => {
      expect(classify('SetUserVar $x = 5')).toBe(LineType.VariableDeclaration);
    });

    it('classifies AddVar as VariableDeclaration', () => {
      expect(classify('AddVar $counter = 1')).toBe(
        LineType.VariableDeclaration
      );
    });

    it('classifies AddUserVar as VariableDeclaration', () => {
      expect(classify('AddUserVar $counter = 1')).toBe(
        LineType.VariableDeclaration
      );
    });
  });

  describe('other lines', () => {
    it('classifies a line with only identifiers as Other', () => {
      expect(classify('unknownword anotherword')).toBe(LineType.Other);
    });

    it('classifies a line with only numbers as Other', () => {
      expect(classify('123 456')).toBe(LineType.Other);
    });
  });

  describe('preserves metadata', () => {
    it('includes lineNumber in result', () => {
      const tokens = tokenizeLine('Store Cue 1');
      const result = classifyLine(tokens, 42, 'Store Cue 1');
      expect(result.lineNumber).toBe(42);
    });

    it('includes rawText in result', () => {
      const text = 'Store Cue 1';
      const tokens = tokenizeLine(text);
      const result = classifyLine(tokens, 0, text);
      expect(result.rawText).toBe(text);
    });

    it('includes tokens in result', () => {
      const text = 'Store Cue 1';
      const tokens = tokenizeLine(text);
      const result = classifyLine(tokens, 0, text);
      expect(result.tokens).toBe(tokens);
    });
  });
});
