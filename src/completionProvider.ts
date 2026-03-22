import * as vscode from 'vscode';
import { keywordDocs, KeywordDoc } from './keywordDocs';

const CATEGORY_KIND_MAP: Record<string, vscode.CompletionItemKind> = {
  function: vscode.CompletionItemKind.Function,
  object: vscode.CompletionItemKind.Class,
  helping: vscode.CompletionItemKind.Keyword,
};

const CATEGORY_LABEL: Record<string, string> = {
  function: 'function keyword',
  object: 'object keyword',
  helping: 'helping keyword',
};

const functionKeywordNames = new Set<string>();
const objectKeywordNames = new Set<string>();

for (const [key, doc] of keywordDocs) {
  if (doc.category === 'function') {
    functionKeywordNames.add(key);
  } else if (doc.category === 'object') {
    objectKeywordNames.add(key);
  }
}

/**
 * Scans tokens backward from the cursor, skipping cue/fixture numbers,
 * to detect whether the most recent keyword token is a function keyword.
 */
function isPrecededByFunctionKeyword(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const lineText = document.lineAt(position.line).text;
  const textBeforeCursor = lineText.substring(0, position.character).trimEnd();
  const tokens = textBeforeCursor.split(/\s+/);

  if (tokens.length === 0) {
    return false;
  }

  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i].toLowerCase();
    if (functionKeywordNames.has(token)) {
      return true;
    }
    if (!/^\d+(\.\d+)?$/.test(tokens[i])) {
      return false;
    }
  }

  return false;
}

function buildCompletionItem(
  doc: KeywordDoc,
  boostObjects: boolean
): vscode.CompletionItem {
  const item = new vscode.CompletionItem(
    doc.name,
    CATEGORY_KIND_MAP[doc.category] ?? vscode.CompletionItemKind.Text
  );

  item.detail = CATEGORY_LABEL[doc.category] ?? doc.category;

  const md = new vscode.MarkdownString();
  md.appendMarkdown(`${doc.description}\n\n`);
  if (doc.syntax) {
    md.appendMarkdown('**Syntax:**\n');
    md.appendCodeblock(doc.syntax, 'gma2');
  }
  if (doc.examples && doc.examples.length > 0) {
    md.appendMarkdown('**Example:**\n');
    for (const example of doc.examples) {
      md.appendCodeblock(example, 'gma2');
    }
  }
  item.documentation = md;

  // sortText prefix: 0=boosted objects, 1=functions, 2=objects, 3=helpers
  if (boostObjects && doc.category === 'object') {
    item.sortText = `0_${doc.name.toLowerCase()}`;
  } else if (doc.category === 'function') {
    item.sortText = `1_${doc.name.toLowerCase()}`;
  } else if (doc.category === 'object') {
    item.sortText = `2_${doc.name.toLowerCase()}`;
  } else {
    item.sortText = `3_${doc.name.toLowerCase()}`;
  }

  return item;
}

export class GMA2CompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] {
    const boostObjects = isPrecededByFunctionKeyword(document, position);

    const items: vscode.CompletionItem[] = [];
    for (const [, doc] of keywordDocs) {
      items.push(buildCompletionItem(doc, boostObjects));
    }

    return items;
  }
}
