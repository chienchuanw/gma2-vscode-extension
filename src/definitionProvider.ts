import * as vscode from 'vscode';
import { analysisCache } from './language/analysisCache';
import { findDeclaration, findVariableNameAtPosition } from './language/variableResolver';

/**
 * Go-to-Definition for `$variable` references. Ctrl/Cmd+Click on a variable
 * (reference or declaration) navigates to its `SetVar`/`AddVar` declaration.
 * Undeclared variables resolve to nothing rather than erroring.
 */
export class GMA2DefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition> {
    const analysis = analysisCache.getOrAnalyze(document);

    const name = findVariableNameAtPosition(analysis, position.line, position.character);
    if (!name) {
      return undefined;
    }

    const declaration = findDeclaration(analysis, name);
    if (!declaration) {
      return undefined;
    }

    return new vscode.Location(
      document.uri,
      new vscode.Range(
        declaration.line,
        declaration.start,
        declaration.line,
        declaration.end
      )
    );
  }
}
