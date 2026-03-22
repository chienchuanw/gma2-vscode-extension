export enum TokenType {
  Keyword = 'Keyword',
  Variable = 'Variable',
  String = 'String',
  Number = 'Number',
  Operator = 'Operator',
  ComparisonOperator = 'ComparisonOperator',
  OptionFlag = 'OptionFlag',
  OpenBracket = 'OpenBracket',
  CloseBracket = 'CloseBracket',
  Comment = 'Comment',
  Identifier = 'Identifier',
  Whitespace = 'Whitespace',
  Unknown = 'Unknown'
}

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

export enum LineType {
  Empty = 'Empty',
  Comment = 'Comment',
  SectionHeader = 'SectionHeader',
  Command = 'Command',
  ConditionalStart = 'ConditionalStart',
  ConditionalEnd = 'ConditionalEnd',
  VariableDeclaration = 'VariableDeclaration',
  Other = 'Other'
}

export interface LineAnalysis {
  lineNumber: number;
  lineType: LineType;
  tokens: Token[];
  rawText: string;
}

export interface BlockPair {
  startLine: number;
  endLine: number | null;
}

export interface SectionRange {
  headerLine: number;
  startLine: number;
  endLine: number;
  title: string;
}

export interface VariableInfo {
  name: string;
  declarationLine: number;
}

export interface VariableReference {
  name: string;
  line: number;
  start: number;
  end: number;
}

export interface DiagnosticHint {
  line: number;
  start: number;
  end: number;
  message: string;
  severity: 'error' | 'warning' | 'information';
}

export interface DocumentAnalysis {
  lines: LineAnalysis[];
  blocks: BlockPair[];
  sections: SectionRange[];
  variables: VariableInfo[];
  variableReferences: VariableReference[];
  diagnosticHints: DiagnosticHint[];
}
