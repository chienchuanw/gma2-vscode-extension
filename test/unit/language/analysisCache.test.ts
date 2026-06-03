import { describe, it, expect } from 'vitest';
import { AnalysisCache } from '../../../src/language/analysisCache';
import { createMockDocument } from '../../helpers/vscode-mock';

// The cache returns the *same* DocumentAnalysis object reference on a hit and a
// freshly computed one on a miss, so object identity is a reliable probe for
// whether a given call was served from cache or recomputed.

// The mock document satisfies the subset of vscode.TextDocument the cache uses;
// `as never` bridges it to the full API type under the test tsconfig.
function mockDoc(lines: string[], uri: string, version: number): never {
  return createMockDocument(lines, uri, version) as never;
}

describe('AnalysisCache', () => {
  it('serves a cache hit when uri and version match', () => {
    const cache = new AnalysisCache();
    const doc = mockDoc(['SetVar $a = 1'], 'file:///a.gma2', 1);

    const first = cache.getOrAnalyze(doc);
    const second = cache.getOrAnalyze(doc);

    expect(second).toBe(first);
  });

  it('recomputes (cache miss) when the document version changes', () => {
    const cache = new AnalysisCache();
    const v1 = mockDoc(['SetVar $a = 1'], 'file:///a.gma2', 1);
    const v2 = mockDoc(['SetVar $a = 1', 'SetVar $b = 2'], 'file:///a.gma2', 2);

    const first = cache.getOrAnalyze(v1);
    const second = cache.getOrAnalyze(v2);

    expect(second).not.toBe(first);
    expect(second.variables.map((variable) => variable.name)).toEqual(['a', 'b']);
  });

  it('recomputes (cache miss) for an unknown uri', () => {
    const cache = new AnalysisCache();
    const a = mockDoc(['SetVar $a = 1'], 'file:///a.gma2', 1);
    const b = mockDoc(['SetVar $b = 2'], 'file:///b.gma2', 1);

    const analysisA = cache.getOrAnalyze(a);
    const analysisB = cache.getOrAnalyze(b);

    expect(analysisB).not.toBe(analysisA);
  });

  it('caches different documents with the same version independently', () => {
    const cache = new AnalysisCache();
    const a = mockDoc(['SetVar $a = 1'], 'file:///a.gma2', 1);
    const b = mockDoc(['SetVar $b = 2'], 'file:///b.gma2', 1);

    const analysisA = cache.getOrAnalyze(a);
    const analysisB = cache.getOrAnalyze(b);

    // Each document keeps its own correct, independently cached analysis.
    expect(cache.getOrAnalyze(a)).toBe(analysisA);
    expect(cache.getOrAnalyze(b)).toBe(analysisB);
    expect(analysisA.variables[0].name).toBe('a');
    expect(analysisB.variables[0].name).toBe('b');
  });

  function fillWithDistinctDocuments(cache: AnalysisCache, count: number) {
    const docs: never[] = [];
    for (let n = 0; n < count; n += 1) {
      docs.push(mockDoc([`SetVar $v${n} = ${n}`], `file:///doc-${n}.gma2`, 1));
    }
    const analyses = docs.map((doc) => cache.getOrAnalyze(doc));
    return { docs, analyses };
  }

  it('evicts the least-recently-used entry once it exceeds 20 entries', () => {
    const cache = new AnalysisCache();
    const { docs, analyses } = fillWithDistinctDocuments(cache, 20);

    // A 21st distinct document pushes the cache over its limit.
    cache.getOrAnalyze(mockDoc(['SetVar $x = 99'], 'file:///doc-extra.gma2', 1));

    // doc-0 was the oldest, so it should have been evicted and now recompute.
    expect(cache.getOrAnalyze(docs[0])).not.toBe(analyses[0]);
    // doc-19 was the most recent of the original 20 and should still be cached.
    expect(cache.getOrAnalyze(docs[19])).toBe(analyses[19]);
  });

  it('keeps an entry that was recently touched when evicting', () => {
    const cache = new AnalysisCache();
    const { docs, analyses } = fillWithDistinctDocuments(cache, 20);

    // Touch doc-0 so it becomes most-recently-used; doc-1 is now the oldest.
    expect(cache.getOrAnalyze(docs[0])).toBe(analyses[0]);

    // Adding a 21st entry should now evict doc-1 instead of doc-0.
    cache.getOrAnalyze(mockDoc(['SetVar $x = 99'], 'file:///doc-extra.gma2', 1));

    expect(cache.getOrAnalyze(docs[0])).toBe(analyses[0]);
    expect(cache.getOrAnalyze(docs[1])).not.toBe(analyses[1]);
  });
});
