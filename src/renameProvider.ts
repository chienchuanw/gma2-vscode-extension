import * as vscode from 'vscode';
import { analysisCache } from './language/analysisCache';
import {
  findVariableNameAtPosition,
  findVariableOccurrences,
  findVariableTokenAtPosition,
} from './language/variableResolver';

const VALID_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Strip an optional leading `$` from a user-typed rename target and validate it
 * as a grandMA2 variable name. Throws (surfacing the message in VS Code's
 * rename UI) when the name is invalid.
 */
export function sanitizeNewName(newName: string): string {
  const trimmed = newName.trim();
  const bare = trimmed.startsWith('$') ? trimmed.slice(1) : trimmed;

  if (!VALID_NAME_PATTERN.test(bare)) {
    throw new Error(
      `"${newName}" is not a valid variable name. Use letters, digits, and underscores, starting with a letter or underscore.`
    );
  }

  return bare;
}

/**
 * Rename for `$variable` declarations and references. F2 on any variable
 * renames all of its occurrences in the file (case-insensitive matching).
 */
export class GMA2RenameProvider implements vscode.RenameProvider {
  prepareRename(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Range> {
    const analysis = analysisCache.getOrAnalyze(document);
    const token = findVariableTokenAtPosition(analysis, position.line, position.character);

    if (!token) {
      throw new Error('You can only rename grandMA2 variables.');
    }

    return new vscode.Range(position.line, token.start, position.line, token.end);
  }

  provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.WorkspaceEdit> {
    const analysis = analysisCache.getOrAnalyze(document);

    const name = findVariableNameAtPosition(analysis, position.line, position.character);
    if (!name) {
      return undefined;
    }

    const bareName = sanitizeNewName(newName);
    const occurrences = findVariableOccurrences(analysis, name);
    if (occurrences.length === 0) {
      return undefined;
    }

    const edit = new vscode.WorkspaceEdit();
    for (const occurrence of occurrences) {
      edit.replace(
        document.uri,
        new vscode.Range(occurrence.line, occurrence.start, occurrence.line, occurrence.end),
        `$${bareName}`
      );
    }

    return edit;
  }
}
