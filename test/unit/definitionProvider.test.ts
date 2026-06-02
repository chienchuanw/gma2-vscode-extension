import { describe, it, expect } from 'vitest';
import { GMA2DefinitionProvider } from '../../src/definitionProvider';
import { createMockDocument, noToken, pos } from '../helpers/vscode-mock';

const provider = new GMA2DefinitionProvider();

describe('GMA2DefinitionProvider', () => {
  it('navigates from a reference to its declaration', () => {
    const doc = createMockDocument(
      ['SetVar $counter = 0', 'Goto Cue $counter'],
      'file:///def-ref.gma2'
    );

    const result = provider.provideDefinition(
      doc as never,
      pos(1, 12) as never,
      noToken as never
    ) as { range: { start: { line: number; character: number }; end: { character: number } } };

    expect(result).toBeDefined();
    expect(result.range.start.line).toBe(0);
    expect(result.range.start.character).toBe(7);
    expect(result.range.end.character).toBe(15);
  });

  it('resolves the declaration to itself', () => {
    const doc = createMockDocument(
      ['SetVar $counter = 0', 'Goto Cue $counter'],
      'file:///def-self.gma2'
    );

    const result = provider.provideDefinition(
      doc as never,
      pos(0, 9) as never,
      noToken as never
    ) as { range: { start: { line: number } } };

    expect(result.range.start.line).toBe(0);
  });

  it('matches case-insensitively', () => {
    const doc = createMockDocument(
      ['SetVar $counter = 0', 'Goto Cue $COUNTER'],
      'file:///def-case.gma2'
    );

    const result = provider.provideDefinition(
      doc as never,
      pos(1, 12) as never,
      noToken as never
    ) as { range: { start: { line: number } } };

    expect(result.range.start.line).toBe(0);
  });

  it('returns undefined for an undeclared variable', () => {
    const doc = createMockDocument(['Goto Cue $undeclared'], 'file:///def-undef.gma2');

    const result = provider.provideDefinition(
      doc as never,
      pos(0, 12) as never,
      noToken as never
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when the cursor is not on a variable', () => {
    const doc = createMockDocument(['SetVar $counter = 0'], 'file:///def-nonvar.gma2');

    const result = provider.provideDefinition(
      doc as never,
      pos(0, 1) as never,
      noToken as never
    );

    expect(result).toBeUndefined();
  });
});
