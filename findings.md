# Findings & Observations

## Project Health (2026-04-13)

- **Tests:** 114 unit tests passing, 6 test files (lexer, lineParser, documentAnalyzer, keywordDocs, completionProvider, diagnosticsProvider)
- **Build:** Compiles cleanly with esbuild
- **Git:** dev branch, issues #1-#4 resolved via PRs #12-#15
- **CI:** GitHub Actions workflow configured for unit + integration tests
- **Issues/PRs:** Issues #5-#11 remain open (features, bugs, docs)

## Architecture Observations

- Well-separated pipeline: lexer → lineParser → documentAnalyzer → providers
- Each provider is a standalone class consuming the shared analysis pipeline
- `keywordDocs.ts` is the largest file (~75KB) — single source of truth for all 304 keywords
- Types are centralized in `src/language/types.ts`, preventing duplication
- The analysis cache prevents redundant work across providers

## Development History Pattern

The project was built incrementally in clear phases:
1. Syntax highlighting (TextMate grammar)
2. Hover documentation (keyword database)
3. Completion + snippets + folding
4. Shared language core (lexer/parser/analyzer) + diagnostics + symbols + semantic tokens
5. Tests + CI

## Bug Fix Findings (2026-04-13)

- **grandMA2 does NOT support escaped quotes** — strings run from `"` to the next `"` with no escape mechanism. The extension adds `\"` support as a scripting convenience (strictly additive).
- **grandMA2 conditionals are single-line** — `[$var > 0] Command` syntax only. `If` is a fixture filter command, `EndIf` is its inline clause terminator. No multi-line conditional blocks exist.
- **`isPrecededByFunctionKeyword` was bypassing the lexer** — using `split(/\s+/)` instead of `tokenizeLine()`, causing token boundary errors with quoted strings.
- **Duplicate cue detection requires two passes** — a single-pass `Set`-based approach cannot retroactively flag the first occurrence.

## Potential Areas for Future Work

- **Marketplace publishing:** Still at v0.0.1, no publisher configured in package.json
- **Lint script:** No dedicated lint command (no ESLint/Biome configured)
- **Coverage reporting:** @vitest/coverage-v8 is installed but coverage output didn't render in terminal — may need investigation
- **Go-to-definition:** Could add definition provider for variables (issue #5 — declaration locations already tracked)
- **Rename support:** Variable rename refactoring (issue #5 — references already tracked by document analyzer)
- **Fuzzy keyword matching:** Improve keyword suggestions with fuzzy matching (issue #7)
- **Extension configuration:** Add user-configurable settings (issue #6)
- **Analysis cache tests:** Unit tests for analysisCache (issue #8)
- **Option flag word boundaries:** Fix option flag tokenization (issue #9)

## Resources
- Official MA Lighting docs: https://help.malighting.com/
- Keyword docs version: grandMA2 v3.9.61.3
- GitHub repo: https://github.com/chienchuanw/gma2-vscode-extension
