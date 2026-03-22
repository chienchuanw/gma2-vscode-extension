import { describe, it, expect } from 'vitest';
import {
  isPrecededByFunctionKeyword,
  buildCompletionItem,
} from '../../src/completionProvider';
import { createMockDocument, CompletionItemKind } from '../helpers/vscode-mock';
import type { KeywordDoc } from '../../src/keywordDocs';

function mockPosition(line: number, character: number) {
  return { line, character };
}

describe('isPrecededByFunctionKeyword', () => {
  it('returns true when function keyword precedes cursor', () => {
    const doc = createMockDocument(['Store ']);
    expect(isPrecededByFunctionKeyword(doc as never, mockPosition(0, 6) as never)).toBe(true);
  });

  it('returns false when object keyword precedes cursor', () => {
    const doc = createMockDocument(['Cue ']);
    expect(isPrecededByFunctionKeyword(doc as never, mockPosition(0, 4) as never)).toBe(false);
  });

  it('returns false on empty line', () => {
    const doc = createMockDocument(['']);
    expect(isPrecededByFunctionKeyword(doc as never, mockPosition(0, 0) as never)).toBe(false);
  });

  it('returns true when function keyword is followed by numbers', () => {
    const doc = createMockDocument(['Store 1 ']);
    expect(isPrecededByFunctionKeyword(doc as never, mockPosition(0, 8) as never)).toBe(true);
  });

  it('returns false when non-function keyword follows function keyword', () => {
    const doc = createMockDocument(['Store Cue ']);
    expect(isPrecededByFunctionKeyword(doc as never, mockPosition(0, 10) as never)).toBe(false);
  });
});

describe('buildCompletionItem', () => {
  const functionDoc: KeywordDoc = {
    name: 'Store',
    category: 'function',
    description: 'Saves programmer content.',
    syntax: 'Store [object]',
    examples: ['Store Cue 1'],
  };

  const objectDoc: KeywordDoc = {
    name: 'Cue',
    category: 'object',
    description: 'A cue object.',
  };

  const helpingDoc: KeywordDoc = {
    name: 'Thru',
    category: 'helping',
    description: 'Range selector.',
  };

  it('sets sortText prefix 1_ for function keywords', () => {
    const item = buildCompletionItem(functionDoc, false);
    expect(item.sortText).toBe('1_store');
  });

  it('sets sortText prefix 2_ for object keywords (not boosted)', () => {
    const item = buildCompletionItem(objectDoc, false);
    expect(item.sortText).toBe('2_cue');
  });

  it('sets sortText prefix 0_ for boosted object keywords', () => {
    const item = buildCompletionItem(objectDoc, true);
    expect(item.sortText).toBe('0_cue');
  });

  it('sets sortText prefix 3_ for helping keywords', () => {
    const item = buildCompletionItem(helpingDoc, false);
    expect(item.sortText).toBe('3_thru');
  });

  it('maps function category to Function kind', () => {
    const item = buildCompletionItem(functionDoc, false);
    expect(item.kind).toBe(CompletionItemKind.Function);
  });

  it('maps object category to Class kind', () => {
    const item = buildCompletionItem(objectDoc, false);
    expect(item.kind).toBe(CompletionItemKind.Class);
  });

  it('maps helping category to Keyword kind', () => {
    const item = buildCompletionItem(helpingDoc, false);
    expect(item.kind).toBe(CompletionItemKind.Keyword);
  });

  it('sets detail from category label', () => {
    const item = buildCompletionItem(functionDoc, false);
    expect(item.detail).toBe('function keyword');
  });

  it('includes documentation markdown', () => {
    const item = buildCompletionItem(functionDoc, false);
    expect(item.documentation).toBeDefined();
  });
});
