import * as vscode from 'vscode';
import { analysisCache } from './language/analysisCache';
import { TokenType } from './language/types';

const tokenTypes = ['variable'];
const tokenModifiers = ['declaration', 'readonly'];

export const SEMANTIC_TOKEN_LEGEND = new vscode.SemanticTokensLegend(
  tokenTypes,
  tokenModifiers
);

function pushDeclarationToken(
  builder: vscode.SemanticTokensBuilder,
  analysis: ReturnType<typeof analysisCache.getOrAnalyze>,
  variableName: string,
  declarationLine: number
): void {
  const line = analysis.lines[declarationLine];
  if (!line) {
    return;
  }

  const declarationToken = line.tokens.find(
    (token) => token.type === TokenType.Variable && token.value.slice(1).toLowerCase() === variableName.toLowerCase()
  );

  if (!declarationToken) {
    return;
  }

  builder.push(
    new vscode.Range(
      declarationLine,
      declarationToken.start,
      declarationLine,
      declarationToken.end
    ),
    'variable',
    ['declaration']
  );
}

export class GMA2SemanticTokenProvider
  implements vscode.DocumentSemanticTokensProvider
{
  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const analysis = analysisCache.getOrAnalyze(document);
    const builder = new vscode.SemanticTokensBuilder(SEMANTIC_TOKEN_LEGEND);

    for (const variable of analysis.variables) {
      pushDeclarationToken(builder, analysis, variable.name, variable.declarationLine);
    }

    for (const reference of analysis.variableReferences) {
      builder.push(
        new vscode.Range(reference.line, reference.start, reference.line, reference.end),
        'variable',
        []
      );
    }

    return builder.build();
  }
}
