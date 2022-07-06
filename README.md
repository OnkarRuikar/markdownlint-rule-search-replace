# markdownlint-rule-search-replace

A custom [markdownlint](https://github.com/DavidAnson/markdownlint) rule to search and replace patterns.

![npm](https://img.shields.io/npm/v/markdownlint-rule-search-replace)

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
        "skip_code": true
      },
      {
         "name": "curly-double-quotes",
         "message": "Do not use curly double quotes.",
         "search_pattern": "/“|”/g",
         "replace": "\""
      }
   ]
  }
}
```
Here,
- `search-replace`: An array of search-replace definitions.
- search-replace definition: defines search term/pattern and replacement.
  - `name`: name of the definition
  - `message`: corresponding message
  - `search`: text to search
  - `search_pattern`: regex pattern to search. Include flags as well, as if you are defining a regex literal in JavaScript, e.g. `/http/g`.
  - `replace`: The replacement string, e.g. `https`. Regex properties like `$1` can be used if `search_pattern` is being used.
  - `skip_code`: Optional. All code(inline and block), which is inside backticks, will be skipped. 

Note, `search` and `search_pattern` are interchangeable. The property `search` is used if both are supplied.

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

### With markdownlint api

Add the rule object to the `customRules` array:

```js
const searchReplace = require("markdownlint-rule-search-replace");

const options = {
  ...
  "customRules": [searchReplace]
};

markdownlint(options, function callback(err, result) {
  if (!err) {
    console.log(result.toString());
  }
});
```
