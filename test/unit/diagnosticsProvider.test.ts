import { describe, it, expect } from 'vitest';
import { findDuplicateCues, findKeywordSuggestion } from '../../src/diagnosticsProvider';
import { LineType, TokenType } from '../../src/language/types';
import type { LineAnalysis } from '../../src/language/types';

describe('findKeywordSuggestion', () => {
  it('suggests Store for a single-edit deletion typo', () => {
    expect(findKeywordSuggestion('Stor')).toBe('Store');
  });

  it('suggests Store for a transposition typo', () => {
    expect(findKeywordSuggestion('Stoer')).toBe('Store');
  });

  it('suggests Store for a missing leading character', () => {
    expect(findKeywordSuggestion('tore')).toBe('Store');
  });

  it('suggests Store for an extra character', () => {
    expect(findKeywordSuggestion('Storee')).toBe('Store');
  });

  it('is case-insensitive', () => {
    expect(findKeywordSuggestion('STOR')).toBe('Store');
  });

  it('returns undefined for a completely unrelated word', () => {
    expect(findKeywordSuggestion('xyzqwplk')).toBeUndefined();
  });

  it('returns undefined for an empty token', () => {
    expect(findKeywordSuggestion('')).toBeUndefined();
  });
});

function makeLine(lineNumber: number, rawText: string): LineAnalysis {
  return {
    lineNumber,
    lineType: LineType.Command,
    tokens: [{ type: TokenType.Keyword, value: rawText, start: 0, end: rawText.length }],
    rawText,
  };
}

describe('findDuplicateCues', () => {
  it('returns both lines when two lines have the same cue number', () => {
    const lines: LineAnalysis[] = [
      makeLine(0, 'Store Cue 1 "Look A"'),
      makeLine(1, 'Go'),
      makeLine(2, 'Store Cue 1 "Look B"'),
    ];

    const result = findDuplicateCues(lines);

    expect(result).toHaveLength(2);

    // First occurrence (line 0) references line 2
    expect(result[0]).toEqual({
      lineNumber: 0,
      cueNumber: '1',
      start: expect.any(Number),
      end: expect.any(Number),
      otherLines: [2],
    });

    // Second occurrence (line 2) references line 0
    expect(result[1]).toEqual({
      lineNumber: 2,
      cueNumber: '1',
      start: expect.any(Number),
      end: expect.any(Number),
      otherLines: [0],
    });
  });

  it('returns all three lines when three lines have the same cue number', () => {
    const lines: LineAnalysis[] = [
      makeLine(0, 'Store Cue 5 "A"'),
      makeLine(1, 'Store Cue 5 "B"'),
      makeLine(2, 'Store Cue 5 "C"'),
    ];

    const result = findDuplicateCues(lines);

    expect(result).toHaveLength(3);

    expect(result[0].lineNumber).toBe(0);
    expect(result[0].otherLines).toEqual([1, 2]);

    expect(result[1].lineNumber).toBe(1);
    expect(result[1].otherLines).toEqual([0, 2]);

    expect(result[2].lineNumber).toBe(2);
    expect(result[2].otherLines).toEqual([0, 1]);
  });

  it('returns empty array when there are no duplicates', () => {
    const lines: LineAnalysis[] = [
      makeLine(0, 'Store Cue 1 "A"'),
      makeLine(1, 'Store Cue 2 "B"'),
      makeLine(2, 'Store Cue 3 "C"'),
    ];

    const result = findDuplicateCues(lines);

    expect(result).toEqual([]);
  });

  it('otherLines uses 0-indexed line numbers matching LineAnalysis', () => {
    const lines: LineAnalysis[] = [
      makeLine(5, 'Store Cue 10 "A"'),
      makeLine(10, 'Store Cue 10 "B"'),
    ];

    const result = findDuplicateCues(lines);

    expect(result).toHaveLength(2);
    expect(result[0].lineNumber).toBe(5);
    expect(result[0].otherLines).toEqual([10]);
    expect(result[1].lineNumber).toBe(10);
    expect(result[1].otherLines).toEqual([5]);
  });

  it('handles decimal cue numbers correctly', () => {
    const lines: LineAnalysis[] = [
      makeLine(0, 'Store Cue 1.5 "A"'),
      makeLine(1, 'Store Cue 1.5 "B"'),
    ];

    const result = findDuplicateCues(lines);

    expect(result).toHaveLength(2);
    expect(result[0].cueNumber).toBe('1.5');
    expect(result[1].cueNumber).toBe('1.5');
    expect(result[0].otherLines).toEqual([1]);
    expect(result[1].otherLines).toEqual([0]);
  });

  it('computes correct start and end positions for the cue number', () => {
    const lines: LineAnalysis[] = [
      makeLine(0, 'Store Cue 42 "A"'),
      makeLine(1, 'Store Cue 42 "B"'),
    ];

    const result = findDuplicateCues(lines);

    // "Store Cue 42" - "42" starts at index 10
    expect(result[0].start).toBe(10);
    expect(result[0].end).toBe(12);
  });

  it('returns empty array when no Store Cue commands exist', () => {
    const lines: LineAnalysis[] = [
      makeLine(0, 'Go'),
      makeLine(1, 'Goto Cue 1'),
    ];

    const result = findDuplicateCues(lines);

    expect(result).toEqual([]);
  });

  it('is case-insensitive for Store Cue matching', () => {
    const lines: LineAnalysis[] = [
      makeLine(0, 'store cue 1 "A"'),
      makeLine(1, 'STORE CUE 1 "B"'),
    ];

    const result = findDuplicateCues(lines);

    expect(result).toHaveLength(2);
  });
});
