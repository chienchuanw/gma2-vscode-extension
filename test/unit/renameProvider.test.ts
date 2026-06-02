import { describe, it, expect } from 'vitest';
import { GMA2RenameProvider, sanitizeNewName } from '../../src/renameProvider';
import { createMockDocument, noToken, pos } from '../helpers/vscode-mock';

const provider = new GMA2RenameProvider();

describe('sanitizeNewName', () => {
  it('accepts a bare valid name', () => {
    expect(sanitizeNewName('newName')).toBe('newName');
  });

  it('strips a leading $', () => {
    expect(sanitizeNewName('$newName')).toBe('newName');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeNewName('  foo ')).toBe('foo');
  });

  it('allows underscores and digits after the first character', () => {
    expect(sanitizeNewName('_my_var2')).toBe('_my_var2');
  });

  it('rejects names starting with a digit', () => {
    expect(() => sanitizeNewName('1bad')).toThrow();
  });

  it('rejects names with spaces or symbols', () => {
    expect(() => sanitizeNewName('has space')).toThrow();
    expect(() => sanitizeNewName('bad-name')).toThrow();
  });

  it('rejects an empty name or a lone $', () => {
    expect(() => sanitizeNewName('')).toThrow();
    expect(() => sanitizeNewName('$')).toThrow();
  });
});

describe('GMA2RenameProvider.prepareRename', () => {
  it('returns the $variable range when on a variable', () => {
    const doc = createMockDocument(['SetVar $counter = 0'], 'file:///rn-prep.gma2');

    const range = provider.prepareRename(
      doc as never,
      pos(0, 9) as never,
      noToken as never
    ) as { start: { character: number }; end: { character: number } };

    expect(range.start.character).toBe(7);
    expect(range.end.character).toBe(15);
  });

  it('throws when the cursor is not on a variable', () => {
    const doc = createMockDocument(['SetVar $counter = 0'], 'file:///rn-prep-bad.gma2');

    expect(() =>
      provider.prepareRename(doc as never, pos(0, 1) as never, noToken as never)
    ).toThrow();
  });
});

describe('GMA2RenameProvider.provideRenameEdits', () => {
  it('renames the declaration and every reference', () => {
    const doc = createMockDocument(
      ['SetVar $counter = 0', 'AddVar $counter = 1', 'Goto Cue $counter'],
      'file:///rn-all.gma2'
    );

    const edit = provider.provideRenameEdits(
      doc as never,
      pos(2, 12) as never,
      '$index',
      noToken as never
    ) as unknown as { edits: Array<{ newText: string; range: { start: { line: number } } }> };

    expect(edit.edits).toHaveLength(3);
    expect(edit.edits.every((e) => e.newText === '$index')).toBe(true);
    expect(edit.edits.map((e) => e.range.start.line).sort()).toEqual([0, 1, 2]);
  });

  it('renames case-insensitively across mixed-case occurrences', () => {
    const doc = createMockDocument(
      ['SetVar $Counter = 0', 'Goto Cue $counter'],
      'file:///rn-case.gma2'
    );

    const edit = provider.provideRenameEdits(
      doc as never,
      pos(0, 9) as never,
      'index',
      noToken as never
    ) as unknown as { edits: Array<{ newText: string }> };

    expect(edit.edits).toHaveLength(2);
    expect(edit.edits.every((e) => e.newText === '$index')).toBe(true);
  });

  it('renames an undeclared variable reference', () => {
    const doc = createMockDocument(['Goto Cue $undeclared'], 'file:///rn-undef.gma2');

    const edit = provider.provideRenameEdits(
      doc as never,
      pos(0, 12) as never,
      'foo',
      noToken as never
    ) as unknown as { edits: Array<{ newText: string }> };

    expect(edit.edits).toHaveLength(1);
    expect(edit.edits[0].newText).toBe('$foo');
  });

  it('returns undefined when the cursor is not on a variable', () => {
    const doc = createMockDocument(['SetVar $counter = 0'], 'file:///rn-nonvar.gma2');

    const result = provider.provideRenameEdits(
      doc as never,
      pos(0, 1) as never,
      'foo',
      noToken as never
    );

    expect(result).toBeUndefined();
  });

  it('throws for an invalid new name', () => {
    const doc = createMockDocument(['SetVar $counter = 0'], 'file:///rn-invalid.gma2');

    expect(() =>
      provider.provideRenameEdits(doc as never, pos(0, 9) as never, '1bad', noToken as never)
    ).toThrow();
  });
});
