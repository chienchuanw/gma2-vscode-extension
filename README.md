# grandMA2 Language Support

Language support for grandMA2 lighting console command scripts in Visual Studio Code. Built for lighting designers and console programmers who author cue sequences, fixture patches, and show files outside the desk environment.

## Overview

The grandMA2 by MA Lighting is an industry-standard console platform deployed across concert touring, theatrical production, broadcast, and architectural installations worldwide. Its command-line interface drives every operation on the desk -- from storing cues and assigning executors to managing fixture selections and running playback macros.

This extension brings first-class editing support for `.gma2` command script files into VS Code, providing syntax highlighting through a TextMate grammar and inline hover documentation sourced from the official MA Lighting help pages. Whether you are pre-programming a festival rig, templating macro sequences for a touring show, or documenting your cue structure for the production crew, this extension keeps the full command reference at your fingertips without leaving the editor.

## Features

- **Semantic keyword highlighting** -- Function keywords, object keywords, and helping keywords are each assigned distinct token scopes, giving you immediate visual separation between commands (`Store`, `Go`, `Select`), target objects (`Cue`, `Fixture`, `Executor`), and control flow helpers (`Thru`, `At`, `Please`).
- **String literals** -- Double-quoted strings used in labels and naming operations are recognized and highlighted.
- **Numeric values** -- Integer and decimal numbers for cue numbers, DMX values, fade times, and fixture addresses are highlighted.
- **Variable references** -- Variables prefixed with `$` (e.g., `$showMode`, `$counter`) are identified and highlighted as distinct tokens.
- **Comment support** -- Line comments beginning with `#` are supported for annotating command scripts.
- **Operator recognition** -- Arithmetic, logical, and command-chaining operators (`+`, `-`, `*`, `/`, `@`, `;`) are highlighted.
- **Case-insensitive matching** -- All keywords are matched regardless of case, consistent with grandMA2 console behavior.
- **Hover documentation** -- Hover over any recognized keyword to display its description, syntax pattern, usage examples, and a direct link to the official MA Lighting documentation.
- **Keyword auto-completion** -- IntelliSense suggestions for all 304 keywords with category-aware icons. After typing a function keyword such as `Store`, object keywords like `Cue`, `Sequence`, and `Preset` are automatically prioritized in the suggestion list.
- **Snippet templates** -- 12 built-in code snippets for common grandMA2 programming patterns. Type a short prefix and press Tab to expand a full command structure with editable placeholders.
- **Bracket condition highlighting** -- Conditional expressions using the `[$var == "value"]` bracket syntax are recognized and scoped, including comparison operators (`==`, `>=`, `<=`, `>`, `<`).
- **Option flag highlighting** -- Command option flags such as `/merge`, `/overwrite`, and `/noconfirm` are recognized as distinct tokens.
- **Code folding** -- Collapsible regions for comment-delimited sections (lines starting with `# ----` or similar separator patterns).

## Hover Documentation

Hovering over a grandMA2 keyword surfaces a tooltip containing:

- **Keyword name and category** -- Identifies the keyword as a function, object, or helping keyword.
- **Description** -- Explanation drawn from the official MA Lighting help documentation.
- **Syntax pattern** -- Shows the expected command structure.
- **Usage examples** -- Practical examples demonstrating the keyword in a real command context.
- **Documentation link** -- Direct link to the corresponding MA Lighting help page.

The documentation database currently covers **304 unique keywords** across all three categories:

| Category | Count | Role |
|---|---|---|
| Function keywords | 171 | Commands that execute operations on the console (e.g., `Store`, `Copy`, `Go`, `Select`, `Park`) |
| Object keywords | 96 | Targets that commands act upon (e.g., `Cue`, `Sequence`, `Fixture`, `Executor`, `Preset`) |
| Helping keywords | 37 | Modifiers and control flow tokens (e.g., `Thru`, `At`, `Please`, `And`, `If`) |

All keyword documentation is based on the **grandMA2 v3.9.61.3** release.

## Supported Keyword Categories

### Function Keywords

Commands that store, recall, modify, and manage show data and console state.

`Store`, `Copy`, `Delete`, `Go`, `Goto`, `Assign`, `Update`, `Move`, `Clear`, `ClearAll`, `Select`, `Off`, `On`, `Edit`, `Label`, `Park`, `Unpark`, `Blackout`, `Flash`, `Solo`, `Stomp`, `Freeze`, and 150 more.

### Object Keywords

Addressable objects within the grandMA2 show file and console architecture.

`Cue`, `Sequence`, `Fixture`, `Group`, `Executor`, `Effect`, `Macro`, `Preset`, `Page`, `Channel`, `Fader`, `Master`, `Layout`, `Timecode`, `MAtricks`, `World`, and 80 more.

### Helping Keywords

Modifiers, range selectors, and control flow tokens used to qualify and chain commands.

`Thru`, `At`, `Please`, `And`, `Or`, `If`, `EndIf`, `Next`, `Previous`, `SetVar`, `AddVar`, `Full`, `Zero`, `Default`, and 23 more.

## Snippet Templates

The extension ships with 12 snippet templates covering the most common grandMA2 command patterns. Type the prefix in a `.gma2` file and press `Tab` to expand the snippet. Tab stops (`$1`, `$2`, ...) let you jump between editable placeholders with the Tab key.

| Prefix | Name | Expands To | Description |
|---|---|---|---|
| `storecue` | Store Cue | `Store Cue {number} "{name}"` | Store a cue into the active sequence with a descriptive label. |
| `selthru` | Select Fixture Thru | `Select Fixture {first} Thru {last}` | Select a contiguous range of fixtures by fixture ID. |
| `condition` | Bracket Condition | `[${variable} == "{value}"] {command}` | Single-line conditional execution using the grandMA2 bracket syntax. |
| `setvar` | Set Variable | `SetVar ${name} = {value}` | Declare or update a global show variable. |
| `assignexec` | Assign to Executor | `Assign Sequence {seq} At Executor {exec}` | Assign a sequence to a physical or virtual executor for playback. |
| `section` | Section Header | `# ---- {Section Name} ----` | Insert a comment-based section divider for script organization. Also serves as a fold point for the folding provider. |
| `cuelist` | Cue List | `Store Cue {1} "{First Look}"`<br>`Store Cue {2} "{Second Look}"`<br>`Store Cue {3} "{Third Look}"`<br>`Go` | Scaffold a short cue sequence with three labeled cues and a Go command to start playback. |
| `fixat` | Fixture At Value | `Fixture {number} At {value}` | Set a single fixture to a specific intensity or attribute value. |
| `copyat` | Copy Object | `Copy {Sequence} {source} At {Sequence} {target}` | Duplicate a show object (sequence, cue, group, etc.) to a new pool location. |
| `labelobj` | Label Object | `Label {Cue} {number} "{name}"` | Assign a human-readable label to any addressable show object. |
| `gotocue` | Goto Cue | `Goto Cue {number}` | Jump playback directly to a specific cue number without running intermediate cues. |
| `effectassign` | Effect Assignment | `Assign Effect {number} At Executor {exec}` | Assign a stored effect to an executor for live triggering. |

Values shown in `{braces}` are tab-stop placeholders. After expanding a snippet, press Tab to advance through each placeholder and type the desired value.

## Installation

### From the VS Code Marketplace

1. Open VS Code.
2. Go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for `grandMA2 Language Support`.
4. Click **Install**.

### From a VSIX Package

```bash
code --install-extension gma2-language-0.0.1.vsix
```

## Getting Started

1. Create or open any file with the `.gma2` extension.
2. Syntax highlighting activates automatically for recognized keywords, strings, numbers, variables, comments, and operators.
3. Hover over any keyword to view its documentation, syntax, and usage examples.

The `.gma2` file extension is a convention for authoring and organizing grandMA2 command sequences outside the console environment -- useful for pre-programming shows, templating reusable macro libraries, and maintaining version-controlled show documentation.

## Example

```gma2
# Pre-show cue programming
Store Cue 1 "House Open"
Store Cue 2 "Pre-Set"
Store Cue 3 "Downstage Wash"
Copy Sequence 1 At Sequence 2
Label Sequence 2 "Backup"

# Fixture selection and intensity
Select Fixture 1 Thru 10
Channel 1 At 75
Fixture 11 Thru 20 At Full

# Executor assignment and playback
Assign Sequence 1 At Executor 1
Go
Goto Cue 3

# Variable-driven conditional execution
SetVar $sceneIndex = 1
[$sceneIndex >= 1] Select Group 1
[$sceneIndex >= 1] Goto Cue $sceneIndex
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/)
- [Visual Studio Code](https://code.visualstudio.com/)

### Build

```bash
pnpm install
pnpm run compile
```

### Watch Mode

```bash
pnpm run watch
```

### Package as VSIX

```bash
pnpm run package
```

### Project Structure

```
gma2-vscode-extension/
  src/
    extension.ts            # Extension entry point; registers all providers
    hoverProvider.ts        # HoverProvider for keyword tooltips
    completionProvider.ts   # CompletionItemProvider for keyword IntelliSense
    foldingProvider.ts      # FoldingRangeProvider for comment-delimited sections
    keywordDocs.ts          # Keyword documentation database (304 entries)
  snippets/
    gma2.json               # Snippet templates for common command patterns
  syntaxes/
    gma2.tmLanguage.json    # TextMate grammar for syntax highlighting
  language-configuration.json
  examples/
    demo.gma2               # Sample file demonstrating all syntax features
```

## About grandMA2

The [grandMA2](https://www.malighting.com/) is a professional lighting control platform by MA Lighting, widely deployed across concert touring, theater, broadcast, corporate events, and architectural installations. Its command-line interface provides full programmatic control over show data -- from fixture patching and cue storage to executor assignment and playback automation.

This extension provides language tooling for grandMA2 command scripts based on the [MA Lighting help documentation](https://help.malighting.com/). It is not affiliated with or endorsed by MA Lighting.

## License

[MIT](LICENSE)
