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

Or ban certain words e.g. "wtf".

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
        "information": "https://example.com/rules/ellipsis",
        "search": "...",
        "replace": "…",
        "searchScope": "text"
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
  - `name`: Name of the definition.
  - `message`: Corresponding message.
  - `information`: Optional. An absolute URL of a link to more information about the sub-rule.
  - `search`: Text or array of texts to search.
  - `searchPattern`: Regex pattern or array of patterns to search. Include flags as well, as if you are defining a regex literal in JavaScript, e.g. `/http/g`.
  - `replace`: Optional. The replacement string(s), e.g. `https`. Regex properties like `$1` can be used if `searchPattern` is being used.
  - `searchScope` Optional. Scope to perform the search in.
    - `all`: Default. Search in all Markdown content.
    - `code`: Search only in code (block and inline). That is code inside code fences and inline backticks.
    - `text`: Search only in Markdown text, skip code.
  - `skipCode`: Optional. All code(inline and block), which is inside backticks, will be skipped. _This property is deprecated use `searchScope` instead._

Properties are case-sensitive and are in camel case.\
**Note:** `search` and `searchPattern` are interchangeable. The property `search` is used if both are supplied.

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

A list of words and corresponding list of replacements can be provided in a single rule:

```json
{
  "default": true,
  "search-replace": {
    "rules": [
      {
        "name": "bad-spellings",
        "message": "Incorrect spelling",
        "search": ["e-mail", "wtf", "web site"],
        "replace": ["email", null, "website"],
        "searchScope": "all"
      }
    ]
  }
}
```

This is a good way to group related search replace terms in one rule. Make sure the replacements are at same indices as the corresponding search terms. In above example, the word "wtf" will get flagged but won't be auto fixed. Use empty replacement(`""`) if you wish to remove it.

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

## Projects using this custom rule

- MDN Web Docs - [code](https://github.com/mdn/content/blob/main/.markdownlint-cli2.jsonc#L125)
