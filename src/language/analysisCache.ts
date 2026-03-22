import * as vscode from 'vscode';
import { analyzeDocument } from './documentAnalyzer';
import { DocumentAnalysis } from './types';

const MAX_ENTRIES = 20;

export class AnalysisCache {
  private readonly cache = new Map<string, DocumentAnalysis>();

  getOrAnalyze(document: vscode.TextDocument): DocumentAnalysis {
    const key = `${document.uri.toString()}:${document.version}`;
    const cached = this.cache.get(key);
    if (cached) {
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }

    const lines: string[] = [];
    for (let i = 0; i < document.lineCount; i += 1) {
      lines.push(document.lineAt(i).text);
    }

    const analysis = analyzeDocument(lines);
    this.cache.set(key, analysis);

    if (this.cache.size > MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    return analysis;
  }
}

export const analysisCache = new AnalysisCache();
