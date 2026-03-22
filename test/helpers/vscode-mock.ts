/**
 * Lightweight vscode API mock for unit tests.
 * Provides stubs for the vscode API surface used by the extension's source modules.
 */

export class Position {
  constructor(
    public readonly line: number,
    public readonly character: number
  ) {}
}

export class Range {
  public readonly start: Position;
  public readonly end: Position;

  constructor(
    startLine: number,
    startCharacter: number,
    endLine: number,
    endCharacter: number
  ) {
    this.start = new Position(startLine, startCharacter);
    this.end = new Position(endLine, endCharacter);
  }
}

export class MarkdownString {
  public value = '';
  public supportHtml = false;

  appendMarkdown(value: string): this {
    this.value += value;
    return this;
  }

  appendCodeblock(code: string, language?: string): this {
    this.value += `\`\`\`${language ?? ''}\n${code}\n\`\`\`\n`;
    return this;
  }
}

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}

export class Diagnostic {
  constructor(
    public readonly range: Range,
    public readonly message: string,
    public readonly severity: DiagnosticSeverity = DiagnosticSeverity.Error
  ) {}
}

export enum CompletionItemKind {
  Text = 0,
  Method = 1,
  Function = 2,
  Constructor = 3,
  Field = 4,
  Variable = 5,
  Class = 6,
  Interface = 7,
  Module = 8,
  Property = 9,
  Unit = 10,
  Value = 11,
  Enum = 12,
  Keyword = 13,
  Snippet = 14,
  Color = 15,
  File = 16,
  Reference = 17,
  Folder = 18,
}

export class CompletionItem {
  public detail?: string;
  public documentation?: MarkdownString;
  public sortText?: string;

  constructor(
    public label: string,
    public kind?: CompletionItemKind
  ) {}
}

export enum FoldingRangeKind {
  Comment = 1,
  Imports = 2,
  Region = 3,
}

export class FoldingRange {
  constructor(
    public start: number,
    public end: number,
    public kind?: FoldingRangeKind
  ) {}
}

export enum SymbolKind {
  File = 0,
  Module = 1,
  Namespace = 2,
  Package = 3,
  Class = 4,
  Method = 5,
  Property = 6,
  Field = 7,
  Constructor = 8,
  Enum = 9,
  Interface = 10,
  Function = 11,
  Variable = 12,
  Constant = 13,
  String = 14,
  Number = 15,
  Boolean = 16,
  Array = 17,
}

export class DocumentSymbol {
  public children: DocumentSymbol[] = [];

  constructor(
    public name: string,
    public detail: string,
    public kind: SymbolKind,
    public range: Range,
    public selectionRange: Range
  ) {}
}

export class SemanticTokensLegend {
  constructor(
    public readonly tokenTypes: string[],
    public readonly tokenModifiers: string[]
  ) {}
}

export class SemanticTokensBuilder {
  private data: Array<{
    range: Range;
    tokenType: string;
    tokenModifiers: string[];
  }> = [];

  constructor(public readonly legend?: SemanticTokensLegend) {}

  push(range: Range, tokenType: string, tokenModifiers: string[]): void {
    this.data.push({ range, tokenType, tokenModifiers });
  }

  build(): SemanticTokens {
    return new SemanticTokens(this.data);
  }
}

export class SemanticTokens {
  public readonly resultId?: string;
  public readonly data: Uint32Array;

  public readonly _rawData: unknown;

  constructor(tokenData?: unknown) {
    this.data = new Uint32Array(0);
    this._rawData = tokenData;
  }
}

export class Hover {
  constructor(
    public contents: MarkdownString,
    public range?: Range
  ) {}
}

export class CancellationTokenSource {
  public token: CancellationToken = {
    isCancellationRequested: false,
    onCancellationRequested: () => ({ dispose: () => {} }),
  };
  cancel(): void {
    this.token.isCancellationRequested = true;
  }
  dispose(): void {}
}

export interface CancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: (listener: () => void) => { dispose: () => void };
}

export interface TextLine {
  text: string;
  range: Range;
  lineNumber: number;
}

export interface TextDocument {
  uri: { toString: () => string };
  version: number;
  lineCount: number;
  lineAt: (line: number) => TextLine;
  getText: (range?: Range) => string;
  getWordRangeAtPosition: (
    position: Position,
    regex?: RegExp
  ) => Range | undefined;
}

/**
 * Creates a mock TextDocument from an array of lines.
 */
export function createMockDocument(
  lines: string[],
  uri = 'file:///test.gma2',
  version = 1
): TextDocument {
  return {
    uri: { toString: () => uri },
    version,
    lineCount: lines.length,
    lineAt: (line: number): TextLine => ({
      text: lines[line],
      range: new Range(line, 0, line, lines[line].length),
      lineNumber: line,
    }),
    getText: (range?: Range): string => {
      if (!range) {
        return lines.join('\n');
      }
      const startLine = range.start.line;
      const endLine = range.end.line;
      if (startLine === endLine) {
        return lines[startLine].substring(
          range.start.character,
          range.end.character
        );
      }
      const result: string[] = [];
      result.push(lines[startLine].substring(range.start.character));
      for (let i = startLine + 1; i < endLine; i++) {
        result.push(lines[i]);
      }
      result.push(lines[endLine].substring(0, range.end.character));
      return result.join('\n');
    },
    getWordRangeAtPosition: (
      position: Position,
      regex?: RegExp
    ): Range | undefined => {
      const line = lines[position.line];
      if (!line) return undefined;
      const pattern = regex ?? /\w+/g;
      const flags = pattern.flags.includes('g')
        ? pattern.flags
        : pattern.flags + 'g';
      const re = new RegExp(pattern.source, flags);
      for (
        let match = re.exec(line);
        match !== null;
        match = re.exec(line)
      ) {
        const start = match.index;
        const end = start + match[0].length;
        if (start <= position.character && position.character <= end) {
          return new Range(position.line, start, position.line, end);
        }
      }
      return undefined;
    },
  };
}

export const languages = {
  match: (): number => 1,
  createDiagnosticCollection: () => ({
    set: () => {},
    delete: () => {},
    dispose: () => {},
  }),
  registerHoverProvider: () => ({ dispose: () => {} }),
  registerCompletionItemProvider: () => ({ dispose: () => {} }),
  registerFoldingRangeProvider: () => ({ dispose: () => {} }),
  registerDocumentSymbolProvider: () => ({ dispose: () => {} }),
  registerDocumentSemanticTokensProvider: () => ({ dispose: () => {} }),
  getDiagnostics: () => [],
};

export const workspace = {
  textDocuments: [] as TextDocument[],
  onDidOpenTextDocument: () => ({ dispose: () => {} }),
  onDidChangeTextDocument: () => ({ dispose: () => {} }),
  onDidCloseTextDocument: () => ({ dispose: () => {} }),
};

export const Uri = {
  file: (path: string) => ({ toString: () => `file://${path}`, fsPath: path }),
  parse: (value: string) => ({ toString: () => value, fsPath: value }),
};

export const commands = {
  executeCommand: async () => undefined,
};

export const window = {
  showInformationMessage: async () => undefined,
  showErrorMessage: async () => undefined,
};
