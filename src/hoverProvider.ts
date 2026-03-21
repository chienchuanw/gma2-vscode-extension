import * as vscode from 'vscode';
import { getKeywordDoc } from './keywordDocs';

export class GMA2HoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const wordRange = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
    if (!wordRange) {
      return undefined;
    }

    const word = document.getText(wordRange);
    const doc = getKeywordDoc(word);
    if (!doc) {
      return undefined;
    }

    const content = new vscode.MarkdownString();
    content.supportHtml = true;

    // Header: keyword name and category
    content.appendMarkdown(`**${doc.name}** _（${doc.category} keyword）_\n\n`);

    // Description
    content.appendMarkdown(`${doc.description}\n\n`);

    // Syntax
    if (doc.syntax) {
      content.appendMarkdown(`**Syntax:**\n`);
      content.appendCodeblock(doc.syntax, 'gma2');
      content.appendMarkdown('\n');
    }

    // Examples
    if (doc.examples && doc.examples.length > 0) {
      content.appendMarkdown(`**Example:**\n`);
      for (const example of doc.examples) {
        content.appendCodeblock(example, 'gma2');
      }
      content.appendMarkdown('\n');
    }

    // Doc link
    if (doc.docUrl) {
      content.appendMarkdown(`📖 [MA Lighting Docs](${doc.docUrl})\n`);
    }

    return new vscode.Hover(content, wordRange);
  }
}
