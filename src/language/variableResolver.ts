import { DocumentAnalysis, Token, TokenType, VariableOccurrence } from './types';

export type { VariableOccurrence };

/**
 * Normalize a variable name for case-insensitive comparison: drop a leading
 * `$` if present and lowercase the rest. grandMA2 treats variable names
 * case-insensitively, consistent with the rest of the extension.
 */
export function normalizeName(name: string): string {
  const withoutDollar = name.startsWith('$') ? name.slice(1) : name;
  return withoutDollar.toLowerCase();
}

/**
 * Find the `$variable` token at a given position, if any. The position is
 * considered "on" the token when it falls anywhere within `[start, end]`
 * (inclusive of both edges, so a caret resting at the end of a variable still
 * resolves — matching VS Code's word-range behavior for F2/go-to-definition).
 *
 * For the unusual case of directly adjacent tokens (e.g. `$a$b`, where one
 * token's `end` equals the next token's `start`), a caret on the shared
 * boundary resolves to the left token, since `find` returns the first match.
 */
export function findVariableTokenAtPosition(
  analysis: DocumentAnalysis,
  line: number,
  character: number
): Token | undefined {
  const lineAnalysis = analysis.lines[line];
  if (!lineAnalysis) {
    return undefined;
  }

  return lineAnalysis.tokens.find(
    (token) =>
      token.type === TokenType.Variable &&
      character >= token.start &&
      character <= token.end
  );
}

/**
 * The normalized name of the variable at a position, or undefined when the
 * position is not on a `$variable` token.
 */
export function findVariableNameAtPosition(
  analysis: DocumentAnalysis,
  line: number,
  character: number
): string | undefined {
  const token = findVariableTokenAtPosition(analysis, line, character);
  return token ? normalizeName(token.value) : undefined;
}

/**
 * Re-find the declaration's `$variable` token range on its line. `VariableInfo`
 * only records the declaration line, not its column range, so we locate the
 * token the same way the semantic-token provider does.
 */
function getDeclarationOccurrence(
  analysis: DocumentAnalysis,
  name: string,
  declarationLine: number
): VariableOccurrence | undefined {
  const line = analysis.lines[declarationLine];
  if (!line) {
    return undefined;
  }

  const target = normalizeName(name);
  const token = line.tokens.find(
    (t) => t.type === TokenType.Variable && normalizeName(t.value) === target
  );

  if (!token) {
    return undefined;
  }

  return { line: declarationLine, start: token.start, end: token.end, isDeclaration: true };
}

/**
 * The declaration occurrence for a variable name, or undefined if the variable
 * is referenced but never declared in this file.
 */
export function findDeclaration(
  analysis: DocumentAnalysis,
  name: string
): VariableOccurrence | undefined {
  const target = normalizeName(name);

  for (const variable of analysis.variables) {
    if (normalizeName(variable.name) === target) {
      return getDeclarationOccurrence(analysis, variable.name, variable.declarationLine);
    }
  }

  return undefined;
}

/**
 * Every occurrence (declarations and references) of a variable name across the
 * document, matched case-insensitively. Used to rename all sites at once.
 *
 * Because matching is case-insensitive, declarations that differ only in case
 * (e.g. `$Counter` and `$counter`) are treated as the same variable and merged
 * into one occurrence set — consistent with how grandMA2 resolves variables.
 */
export function findVariableOccurrences(
  analysis: DocumentAnalysis,
  name: string
): VariableOccurrence[] {
  const target = normalizeName(name);
  const occurrences: VariableOccurrence[] = [];

  for (const variable of analysis.variables) {
    if (normalizeName(variable.name) !== target) {
      continue;
    }
    const declaration = getDeclarationOccurrence(
      analysis,
      variable.name,
      variable.declarationLine
    );
    if (declaration) {
      occurrences.push(declaration);
    }
  }

  for (const reference of analysis.variableReferences) {
    if (normalizeName(reference.name) !== target) {
      continue;
    }
    occurrences.push({
      line: reference.line,
      start: reference.start,
      end: reference.end,
      isDeclaration: false,
    });
  }

  return occurrences;
}
