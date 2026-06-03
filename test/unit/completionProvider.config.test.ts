import { describe, it, expect } from 'vitest';
import { resolveBoostObjects, buildCompletionItem } from '../../src/completionProvider';
import { keywordDocs } from '../../src/keywordDocs';

describe('resolveBoostObjects', () => {
  it('boosts only when the setting is enabled and a function keyword precedes', () => {
    expect(resolveBoostObjects(true, true)).toBe(true);
    expect(resolveBoostObjects(false, true)).toBe(false);
    expect(resolveBoostObjects(true, false)).toBe(false);
    expect(resolveBoostObjects(false, false)).toBe(false);
  });
});

describe('buildCompletionItem boosting', () => {
  const objectDoc = [...keywordDocs.values()].find((doc) => doc.category === 'object');

  it('gives object keywords a boosted sortText when boosting is on', () => {
    expect(objectDoc).toBeDefined();
    expect(buildCompletionItem(objectDoc!, true).sortText?.startsWith('0_')).toBe(true);
  });

  it('gives object keywords the default sortText when boosting is off', () => {
    expect(buildCompletionItem(objectDoc!, false).sortText?.startsWith('2_')).toBe(true);
  });
});
