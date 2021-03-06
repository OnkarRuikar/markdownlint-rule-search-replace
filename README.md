# markdownlint-rule-search-replace

A custom [markdownlint](https://github.com/DavidAnson/markdownlint) rule to search and replace patterns.

[![npm](https://img.shields.io/npm/v/markdownlint-rule-search-replace)](https://www.npmjs.com/package/markdownlint-rule-search-replace)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Overview

In markdown files, sometimes we want to replace certain characters or patterns.
For example,

- curly quotes `“` to straight quotes `"`
- double hyphens `--` to m-dash `—`
- three dots `...` to ellipsis `…`

Or specific cases like replace three backticks with one. [[ref](https://github.com/DavidAnson/markdownlint/issues/411)]

Or ban certain words.

In such scenarios the `markdownlint-rule-search-replace` rule can be used to flag or fix such occurrences.

## Installation

Use following command to install

```shell
npm install markdownlint-rule-search-replace --save-dev
```

## Configuration

There are various ways markdownlint can be configured using objects, config files etc. For more information on markdownlint configuration refer [options.config](https://github.com/DavidAnson/markdownlint#optionsconfig).

### Using .markdownlint.json config file

You'll have to add a configuration entry in the .markdownlint.json file.
For example,

```json
{
  "default": true,
  "MD001": false,
  "search-replace": {
    "rules": [
      {
        "name": "ellipsis",
        "message": "Do not use three dots '...' for ellipsis.",
        "search": "...",
        "replace": "…",
        "skipCode": true
      },
      {
        "name": "curly-double-quotes",
        "message": "Do not use curly double quotes.",
        "searchPattern": "/“|”/g",
        "replace": "\""
      }
    ]
  }
}
```

Here,

- `search-replace`: The rule configuration object.
- `rules`: An array of search-replace definitions.
- search-replace definition: defines search term/pattern and replacement.
  - `name`: name of the definition
  - `message`: corresponding message
  - `search`: text to search
  - `searchPattern`: regex pattern to search. Include flags as well, as if you are defining a regex literal in JavaScript, e.g. `/http/g`.
  - `replace`: Optional. The replacement string, e.g. `https`. Regex properties like `$1` can be used if `searchPattern` is being used.
  - `skipCode`: Optional. All code(inline and block), which is inside backticks, will be skipped.

Note, `search` and `searchPattern` are interchangeable. The property `search` is used if both are supplied.

In patterns, to escape characters use `\\`. For example,

```json
{
  "default": true,
  "search-replace": {
    "rules": [
      {
        "name": "test",
        "message": "bla bla bla",
        "searchPattern": "^/\\.\\.\\.(.*)\\.\\.\\.$/mg",
        "replace": "-- $1 --"
      }
    ]
  }
}
```

This will replace line `...abcd...` with `-- abcd --`.

### Disable rule options

The rule can be disabled for specific section or file. For example, if you want to disable the rule for a particular section:

```md
...

### Markdown rules to follow

The rules are:

<!-- markdownlint-disable search-replace -->

- Do not use three dots '...' for ellipsis. Use '…' instead.
- Do not use two hyphens '--' use m-dash '—'.
<!-- markdownlint-enable search-replace -->

...
```

Here, the markdownlint will not apply the search-replace rule on the list.
For more options refer [Configuration](https://github.com/DavidAnson/markdownlint#configuration) section on markdownlint repo page.

## Usage

There are various ways to run markdownlint.

### With markdownlint-cli

Use following command for [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli):

```shell
markdownlint test.md -r markdownlint-rule-search-replace
# or
markdownlint test.md -r markdownlint-rule-search-replace --fix
```

### With markdownlint API

Add the rule object to the `customRules` array:

```js
const markdownlint = require("markdownlint");
const searchReplace = require("markdownlint-rule-search-replace");

const options = {
  files: ["myMarkdown.md"],
  config: {
    default: true,
    "search-replace": {
      rules: [
        {
          name: "m-dash",
          message: "Don't use '--'.",
          search: "--",
          replace: "—",
        },
      ],
    },
  },
  customRules: [searchReplace],
};

markdownlint(options, function callback(err, result) {
  if (!err) {
    console.log(result.toString());
  }
});
```
