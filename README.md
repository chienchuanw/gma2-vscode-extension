# grandMA2 Language Support

Syntax highlighting for grandMA2 command scripts in VS Code.

## Features

- **Semantic keyword categorization** — Function keywords, object keywords, and helping keywords are highlighted distinctly
- **String highlighting** — Double-quoted strings are recognized and highlighted
- **Number highlighting** — Integer and decimal numbers are highlighted
- **Variable highlighting** — Variables prefixed with `$` are highlighted
- **Comment support** — Line comments starting with `#` are supported
- **Operator highlighting** — Mathematical and logical operators are highlighted
- **Case-insensitive keyword matching** — Keywords work regardless of case

## Supported Keyword Categories

### Function Keywords
Store, Copy, Delete, Go, Goto, Assign, Update, Move, Clear, ClearAll, Select, Off, On, Edit, Label, Park, Unpark, and 90+ more

### Object Keywords
Cue, Sequence, Fixture, Group, Executor, Effect, Macro, Preset, Page, Channel, and 114+ more

### Helping Keywords
Thru, At, Please, And, Or, If, Not, Then, Else, With, and 44+ more

## Usage

1. Install the extension from the VS Code marketplace
2. Open any `.gma2` file to see syntax highlighting
3. The `.gma2` file extension is a convention for grandMA2 command scripts

## Example

```gma2
# grandMA2 Command Script Example
Store Cue 1
Copy Sequence 1 At Sequence 2
Select Fixture 1 Thru 10
Channel 1 At 75
Label Cue 1 "Opening Look"
Go
```

## About grandMA2

grandMA2 is a professional lighting control console by MA Lighting. This extension provides syntax highlighting for grandMA2 command scripts based on the [MA Lighting help documentation](https://help.malighting.com).

The `.gma2` file extension is a convention for organizing and editing grandMA2 command sequences outside the console environment.
