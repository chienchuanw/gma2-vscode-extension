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

## Hover Documentation

Hovering over a grandMA2 keyword surfaces a tooltip containing:

- **Keyword name and category** -- Identifies the keyword as a function, object, or helping keyword.
- **Description** -- Explanation drawn from the official MA Lighting help documentation.
- **Syntax pattern** -- Shows the expected command structure.
- **Usage examples** -- Practical examples demonstrating the keyword in a real command context.
- **Documentation link** -- Direct link to the corresponding MA Lighting help page.

The documentation database currently covers **305 keywords** across all three categories:

| Category | Count | Role |
|---|---|---|
| Function keywords | 172 | Commands that execute operations on the console (e.g., `Store`, `Copy`, `Go`, `Select`, `Park`) |
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

# Variable-driven macro logic
SetVar $sceneIndex = 1
If $sceneIndex And Fixture 1
  Select Group 1
  Goto Cue $sceneIndex
EndIf
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
    extension.ts          # Extension entry point; registers the hover provider
    hoverProvider.ts      # HoverProvider implementation for keyword tooltips
    keywordDocs.ts        # Keyword documentation database (305 entries)
  syntaxes/
    gma2.tmLanguage.json  # TextMate grammar for syntax highlighting
  language-configuration.json  # Language configuration (comments, brackets)
  examples/
    demo.gma2             # Sample file demonstrating all syntax features
```

## About grandMA2

The [grandMA2](https://www.malighting.com/) is a professional lighting control platform by MA Lighting, widely deployed across concert touring, theater, broadcast, corporate events, and architectural installations. Its command-line interface provides full programmatic control over show data -- from fixture patching and cue storage to executor assignment and playback automation.

This extension provides language tooling for grandMA2 command scripts based on the [MA Lighting help documentation](https://help.malighting.com/). It is not affiliated with or endorsed by MA Lighting.

## License

[MIT](LICENSE)
