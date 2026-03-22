import { describe, it, expect } from 'vitest';
import { analyzeDocument } from '../../../src/language/documentAnalyzer';

describe('analyzeDocument', () => {
  describe('empty document', () => {
    it('returns empty arrays for an empty document', () => {
      const result = analyzeDocument([]);
      expect(result.lines).toEqual([]);
      expect(result.sections).toEqual([]);
      expect(result.variables).toEqual([]);
      expect(result.variableReferences).toEqual([]);
      expect(result.diagnosticHints).toEqual([]);
    });
  });

  describe('section extraction', () => {
    it('extracts a single section', () => {
      const lines = [
        '# ---- Section A ----',
        'Store Cue 1 "Look"',
        'Go',
      ];
      const result = analyzeDocument(lines);
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Section A');
      expect(result.sections[0].headerLine).toBe(0);
      expect(result.sections[0].endLine).toBe(2);
    });

    it('extracts multiple sections', () => {
      const lines = [
        '# ---- Act One ----',
        'Store Cue 1 "Overture"',
        '',
        '# ---- Act Two ----',
        'Store Cue 10 "Intermission End"',
      ];
      const result = analyzeDocument(lines);
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].title).toBe('Act One');
      expect(result.sections[0].headerLine).toBe(0);
      expect(result.sections[0].endLine).toBe(2);
      expect(result.sections[1].title).toBe('Act Two');
      expect(result.sections[1].headerLine).toBe(3);
      expect(result.sections[1].endLine).toBe(4);
    });

    it('parses section title from separator pattern', () => {
      const lines = ['# ==== My Title ====', 'Go'];
      const result = analyzeDocument(lines);
      expect(result.sections[0].title).toBe('My Title');
    });

    it('handles section at end of document with trailing empty lines', () => {
      const lines = [
        '# ---- Section ----',
        'Store Cue 1 "Look"',
        '',
        '',
      ];
      const result = analyzeDocument(lines);
      expect(result.sections[0].endLine).toBe(1);
    });
  });

  describe('variable tracking', () => {
    it('tracks SetVar declarations', () => {
      const lines = ['SetVar $counter = 0'];
      const result = analyzeDocument(lines);
      expect(result.variables).toHaveLength(1);
      expect(result.variables[0].name).toBe('counter');
      expect(result.variables[0].declarationLine).toBe(0);
    });

    it('tracks AddVar declarations', () => {
      const lines = ['AddVar $counter = 1'];
      const result = analyzeDocument(lines);
      expect(result.variables).toHaveLength(1);
      expect(result.variables[0].name).toBe('counter');
    });

    it('tracks multiple variable declarations', () => {
      const lines = [
        'SetVar $a = 1',
        'SetVar $b = 2',
      ];
      const result = analyzeDocument(lines);
      expect(result.variables).toHaveLength(2);
      expect(result.variables[0].name).toBe('a');
      expect(result.variables[1].name).toBe('b');
    });

    it('strips $ prefix from variable names', () => {
      const lines = ['SetVar $myVar = 1'];
      const result = analyzeDocument(lines);
      expect(result.variables[0].name).toBe('myVar');
    });
  });

  describe('variable references', () => {
    it('collects variable references in commands', () => {
      const lines = [
        'SetVar $counter = 0',
        'Goto Cue $counter',
      ];
      const result = analyzeDocument(lines);
      expect(result.variableReferences).toHaveLength(1);
      expect(result.variableReferences[0].name).toBe('counter');
      expect(result.variableReferences[0].line).toBe(1);
    });

    it('excludes declaration position from references', () => {
      const lines = ['SetVar $counter = 0'];
      const result = analyzeDocument(lines);
      expect(result.variableReferences).toHaveLength(0);
    });

    it('collects references in conditionals', () => {
      const lines = [
        'SetVar $x = 1',
        '[$x >= 1] Go',
      ];
      const result = analyzeDocument(lines);
      expect(result.variableReferences).toHaveLength(1);
      expect(result.variableReferences[0].name).toBe('x');
    });

    it('collects multiple references to the same variable', () => {
      const lines = [
        'SetVar $v = 1',
        'Goto Cue $v',
        'Select Group $v',
      ];
      const result = analyzeDocument(lines);
      expect(result.variableReferences).toHaveLength(2);
    });
  });

  describe('diagnostic hints', () => {
    it('detects unclosed string literals', () => {
      const lines = ['Label Cue 1 "Unclosed'];
      const result = analyzeDocument(lines);
      expect(result.diagnosticHints).toHaveLength(1);
      expect(result.diagnosticHints[0].severity).toBe('error');
      expect(result.diagnosticHints[0].message).toBe('Unclosed string literal.');
    });

    it('does not flag closed strings', () => {
      const lines = ['Store Cue 1 "Valid"'];
      const result = analyzeDocument(lines);
      expect(result.diagnosticHints).toHaveLength(0);
    });

    it('handles document with only comments', () => {
      const lines = [
        '# comment one',
        '# comment two',
      ];
      const result = analyzeDocument(lines);
      expect(result.diagnosticHints).toHaveLength(0);
    });
  });

  describe('line analysis', () => {
    it('analyzes every line in the document', () => {
      const lines = [
        'Store Cue 1 "Look"',
        '',
        '# comment',
      ];
      const result = analyzeDocument(lines);
      expect(result.lines).toHaveLength(3);
    });
  });
});
