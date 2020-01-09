# Choose Text Editor

Get path to a text editor executable base on some environment variables

## Configuration

### Location

This package uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to load configuration. It will search files with matching name from working directory to `stopDir` (default to home directory).

**Names:**

- `choose-text-editor` (yaml format)
- `choose-text-editor.json`
- `choose-text-editor.yaml`
- `choose-text-editor.config.js`
- `choose-text-editor.js`
- `package.json#choose-text-editor`
- `package.yaml#choose-text-editor`

## Schema

A config file have a structure satisfies [schemas/editor-set.schema.json](https://raw.githubusercontent.com/KSXGitHub/personal-packages/%40khai96x/choose-text-editor/0.1.0/packages/choose-text-editor/schemas/editor-set.schema.json) or [EditorSet interface](https://github.com/KSXGitHub/personal-packages/blob/%40khai96x/choose-text-editor/0.1.0/packages/choose-text-editor/lib/editors.ts#L1-L5)

## Example Configuration

```json
{
  "$schema": "https://raw.githubusercontent.com/KSXGitHub/personal-packages/%40khai96x/choose-text-editor/0.1.0/packages/choose-text-editor/schemas/editor-set.schema.json#",
  "graphical": [
    { "program": "code", "flags": ["wait"] },
    { "program": "atom", "suffixes": ["--wait"] }
  ],
  "terminal": [
    { "program": "vim" }
  ],
  "chooser": "@khai96x/choose-text-editor@^0.1.0"
}
```

## Environment Variables

* When `FORCE_EDITOR` is set, `choose-text-editor` will skip reading config and choose forced editor.
* When `FORCE_EDITOR` is not set, `ISINTTY` must always be set to either `true` or `false` (case-sensitive):
  - `ISINTTY=true` to consider only terminal editors.
  - `ISINTTY=false` to consider graphical editors before terminal editors.
* `FORCE_EDITOR_PREFIXES` when set, must be a valid yaml array of string. This prefix will be added to output command line.

## Basic Commands

### Find an editor and display its command

```sh
ISINTTY=false
choose-text-editor
```

### Find an editor to open a file

```sh
ISINTTY=false
choose-text-editor -x exec -- my-file.txt
```

### Print help message

```sh
choose-text-editor --help
```

## License

[MIT](https://git.io/fj9XO) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
