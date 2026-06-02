import { describe, it, expect } from 'vitest';
import { analyzeDocument } from '../../../src/language/documentAnalyzer';
import {
  findDeclaration,
  findVariableNameAtPosition,
  findVariableOccurrences,
  findVariableTokenAtPosition,
  normalizeName,
} from '../../../src/language/variableResolver';

// Columns referenced below:
//   line 0: "SetVar $counter = 0"   -> $counter at [7, 15)
//   line 1: "AddVar $Counter = 1"   -> $Counter at [7, 15)  (different case)
//   line 2: "Goto Cue $counter"     -> $counter at [9, 17)
//   line 3: "Select Group $showMode"-> $showMode at [13, 22) (undeclared reference)
const SOURCE = [
  'SetVar $counter = 0',
  'AddVar $Counter = 1',
  'Goto Cue $counter',
  'Select Group $showMode',
];

function analyze() {
  return analyzeDocument(SOURCE);
}

describe('normalizeName', () => {
  it('strips a leading $ and lowercases', () => {
    expect(normalizeName('$Counter')).toBe('counter');
    expect(normalizeName('counter')).toBe('counter');
    expect(normalizeName('$SHOW_Mode')).toBe('show_mode');
  });
});

describe('findVariableTokenAtPosition', () => {
  it('finds the token when the position is inside it', () => {
    const token = findVariableTokenAtPosition(analyze(), 0, 10);
    expect(token?.value).toBe('$counter');
    expect(token?.start).toBe(7);
    expect(token?.end).toBe(15);
  });

  it('matches at the leading and trailing edges of the token', () => {
    const analysis = analyze();
    expect(findVariableTokenAtPosition(analysis, 0, 7)?.value).toBe('$counter');
    expect(findVariableTokenAtPosition(analysis, 0, 15)?.value).toBe('$counter');
  });

  it('returns undefined when the position is not on a variable', () => {
    expect(findVariableTokenAtPosition(analyze(), 0, 2)).toBeUndefined();
  });

  it('returns undefined for an out-of-range line', () => {
    expect(findVariableTokenAtPosition(analyze(), 99, 0)).toBeUndefined();
  });
});

describe('findVariableNameAtPosition', () => {
  it('returns the normalized name at a reference', () => {
    expect(findVariableNameAtPosition(analyze(), 2, 12)).toBe('counter');
  });

  it('returns the normalized name at a declaration regardless of case', () => {
    expect(findVariableNameAtPosition(analyze(), 1, 10)).toBe('counter');
  });

  it('returns undefined off a variable', () => {
    expect(findVariableNameAtPosition(analyze(), 2, 0)).toBeUndefined();
  });
});

describe('findDeclaration', () => {
  it('resolves a name to its first declaration with correct range', () => {
    const declaration = findDeclaration(analyze(), 'counter');
    expect(declaration).toEqual({ line: 0, start: 7, end: 15, isDeclaration: true });
  });

  it('matches case-insensitively', () => {
    expect(findDeclaration(analyze(), 'COUNTER')?.line).toBe(0);
  });

  it('returns undefined for a variable that is referenced but never declared', () => {
    expect(findDeclaration(analyze(), 'showMode')).toBeUndefined();
  });
});

describe('findVariableOccurrences', () => {
  it('collects both declarations (any case) and references', () => {
    const occurrences = findVariableOccurrences(analyze(), 'counter');

    expect(occurrences).toEqual([
      { line: 0, start: 7, end: 15, isDeclaration: true },
      { line: 1, start: 7, end: 15, isDeclaration: true },
      { line: 2, start: 9, end: 17, isDeclaration: false },
    ]);
  });

  it('collects an undeclared variable reference', () => {
    const occurrences = findVariableOccurrences(analyze(), 'showMode');
    expect(occurrences).toEqual([{ line: 3, start: 13, end: 22, isDeclaration: false }]);
  });

  it('returns an empty array for an unknown variable', () => {
    expect(findVariableOccurrences(analyze(), 'nope')).toEqual([]);
  });
});
