import { describe, it, expect } from 'vitest';
import { collectDiagnostics, Gma2DiagnosticsConfig } from '../../src/diagnosticsProvider';
import { createMockDocument } from '../helpers/vscode-mock';

// One document that triggers all three toggleable diagnostic categories:
//   line 0: unknown keyword ("Storee")
//   lines 1-2: duplicate "Store Cue 5"
//   line 3: undefined variable ("$undeclared")
const LINES = ['Storee Cue 1', 'Store Cue 5', 'Store Cue 5', 'Goto Cue $undeclared'];

const ALL_ON: Gma2DiagnosticsConfig = {
  unknownKeywords: true,
  undefinedVariables: true,
  duplicateCues: true,
};

function messagesFor(config: Gma2DiagnosticsConfig, uri: string): string[] {
  const doc = createMockDocument(LINES, uri);
  return collectDiagnostics(doc as never, config).map((d) => d.message);
}

describe('collectDiagnostics configuration', () => {
  it('reports every category when all are enabled', () => {
    const messages = messagesFor(ALL_ON, 'file:///cfg-all.gma2');
    expect(messages.some((m) => m.includes('Unknown keyword'))).toBe(true);
    expect(messages.some((m) => m.includes('not declared'))).toBe(true);
    expect(messages.filter((m) => m.includes('Duplicate cue'))).toHaveLength(2);
  });

  it('suppresses unknown keyword warnings when disabled', () => {
    const messages = messagesFor({ ...ALL_ON, unknownKeywords: false }, 'file:///cfg-uk.gma2');
    expect(messages.some((m) => m.includes('Unknown keyword'))).toBe(false);
    expect(messages.some((m) => m.includes('not declared'))).toBe(true);
    expect(messages.some((m) => m.includes('Duplicate cue'))).toBe(true);
  });

  it('suppresses undefined variable diagnostics when disabled', () => {
    const messages = messagesFor({ ...ALL_ON, undefinedVariables: false }, 'file:///cfg-uv.gma2');
    expect(messages.some((m) => m.includes('not declared'))).toBe(false);
    expect(messages.some((m) => m.includes('Unknown keyword'))).toBe(true);
  });

  it('suppresses duplicate cue diagnostics when disabled', () => {
    const messages = messagesFor({ ...ALL_ON, duplicateCues: false }, 'file:///cfg-dc.gma2');
    expect(messages.some((m) => m.includes('Duplicate cue'))).toBe(false);
    expect(messages.some((m) => m.includes('Unknown keyword'))).toBe(true);
  });
});
