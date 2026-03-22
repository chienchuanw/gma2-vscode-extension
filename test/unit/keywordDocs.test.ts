import { describe, it, expect } from 'vitest';
import { keywordDocs, getKeywordDoc } from '../../src/keywordDocs';

describe('keywordDocs', () => {
  it('contains exactly 304 keywords', () => {
    expect(keywordDocs.size).toBe(304);
  });

  it('has 171 function keywords', () => {
    const count = [...keywordDocs.values()].filter(
      (d) => d.category === 'function'
    ).length;
    expect(count).toBe(171);
  });

  it('has 96 object keywords', () => {
    const count = [...keywordDocs.values()].filter(
      (d) => d.category === 'object'
    ).length;
    expect(count).toBe(96);
  });

  it('has 37 helping keywords', () => {
    const count = [...keywordDocs.values()].filter(
      (d) => d.category === 'helping'
    ).length;
    expect(count).toBe(37);
  });

  it('every entry has required fields', () => {
    for (const [key, doc] of keywordDocs) {
      expect(doc.name, `${key} missing name`).toBeTruthy();
      expect(doc.category, `${key} missing category`).toMatch(
        /^(function|object|helping)$/
      );
      expect(doc.description, `${key} missing description`).toBeTruthy();
    }
  });

  it('keys are lowercase versions of names', () => {
    for (const [key, doc] of keywordDocs) {
      expect(key).toBe(doc.name.toLowerCase());
    }
  });
});

describe('getKeywordDoc', () => {
  it('returns doc for a known keyword', () => {
    const doc = getKeywordDoc('Store');
    expect(doc).toBeDefined();
    expect(doc?.name).toBe('Store');
    expect(doc?.category).toBe('function');
  });

  it('is case-insensitive', () => {
    expect(getKeywordDoc('STORE')?.name).toBe('Store');
    expect(getKeywordDoc('store')?.name).toBe('Store');
    expect(getKeywordDoc('Store')?.name).toBe('Store');
  });

  it('returns undefined for unknown keyword', () => {
    expect(getKeywordDoc('NotAKeyword')).toBeUndefined();
  });

  it('returns doc for object keywords', () => {
    const doc = getKeywordDoc('Cue');
    expect(doc?.category).toBe('object');
  });

  it('returns doc for helping keywords', () => {
    const doc = getKeywordDoc('Thru');
    expect(doc?.category).toBe('helping');
  });
});
