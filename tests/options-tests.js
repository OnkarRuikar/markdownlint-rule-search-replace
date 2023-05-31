// @ts-check

"use strict";

const test = require("ava").default;
const markdownlint = require("markdownlint");
const searchReplace = require("../rule");
const check = require("./utils").check;

const inputFile = "./tests/data/options-tests.md";

test("checkMandatoryProperties", (t) => {
  let options = {
    config: JSON.parse(`{
      "default": true,
      "search-replace": {
        "rules": [{}]
      }
    }`),
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };

  t.throws(() => markdownlint.sync(options), {
    message: "Provide either `search` or `searchPattern` option.",
  });

  options = {
    config: JSON.parse(`{
      "default": true,
      "search-replace": {
        "rules": [
          {
            "searchpattern": "/abc/g"
          }
        ]
      }
    }`),
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };

  t.throws(() => markdownlint.sync(options), {
    message: "Provide either `search` or `searchPattern` option.",
  });
});

test("checkPropertiesDefault", (t) => {
  const options = {
    config: JSON.parse(`{
      "default": true,
      "search-replace": {
        "rules": [
          {
            "name": "m-dash",
            "message": "Don't use '--'.",
            "search": "--",
            "replace": "—"
          }
        ]
      }
    }`),
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 1 text:'--'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 6 text:'--'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 11 text:'--'"]
./tests/data/options-tests.md: 6: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 18 text:'--'"]
./tests/data/options-tests.md: 9: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 15 text:'--'"]`;

  check(t, options, expected);
});

test("checkPropertiesRegex", (t) => {
  const options = {
    config: JSON.parse(`{
      "default": true,
      "search-replace": {
        "rules": [
          {
            "name": "m-dash",
            "message": "Don't use '--'.",
            "searchPattern": "/--/g",
            "replace": "—"
          }
        ]
      }
    }`),
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 1 text:'--'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 6 text:'--'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 11 text:'--'"]
./tests/data/options-tests.md: 6: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 18 text:'--'"]
./tests/data/options-tests.md: 9: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 15 text:'--'"]`;

  check(t, options, expected);
});

test("checkSearchOnlyText", (t) => {
  const options = {
    config: JSON.parse(`{
      "default": true,
      "search-replace": {
        "rules": [
          {
            "name": "m-dash",
            "message": "Don't use '--'.",
            "search": "--",
            "replace": "—"
          }
        ]
      }
    }`),
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };

  // Check skip via searchScope: "text"
  options.config["search-replace"].rules[0].searchScope = "text";
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 1 text:'--'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 6 text:'--'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 11 text:'--'"]`;
  check(t, options, expected);

  // Check skip via skipCode: true
  delete options.config["search-replace"].rules[0].searchScope;
  options.config["search-replace"].rules[0].skipCode = true;
  check(t, options, expected);
});

test("checkPropertiesSearchScopeCode", (t) => {
  const options = {
    config: JSON.parse(`{
      "default": true,
      "search-replace": {
        "rules": [
          {
            "name": "m-dash",
            "message": "Don't use '--'.",
            "search": "--",
            "replace": "—",
            "searchScope": "code"
          }
        ]
      }
    }`),
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };
  const expected = `./tests/data/options-tests.md: 6: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 18 text:'--'"]
./tests/data/options-tests.md: 9: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 15 text:'--'"]`;

  check(t, options, expected);
});

test("checkPropertiesSearchScopeWarning", (t) => {
  for (const searchScopeValue of ["all", "code", "text"]) {
    for (const skipCodeValue of [true, false]) {
      const options = {
        config: JSON.parse(`{
          "default": true,
          "search-replace": {
            "rules": [
              {
                "name": "m-dash",
                "message": "Don't use '--'.",
                "search": "--",
                "replace": "—",
                "skipCode": "${skipCodeValue}",
                "searchScope": "${searchScopeValue}"
              }
            ]
          }
        }`),
        customRules: [searchReplace],
        resultVersion: 3,
        files: [inputFile],
      };

      t.throws(() => markdownlint.sync(options), {
        message:
          "Both `searchScope` and `skipCode` specified, `skipCode` is deprecated, use `searchScope` instead.",
      });
    }
  }
});

test("checkPropertiesSearchScopeInvalid", (t) => {
  for (const setting of ["", false, "yes", { asd: true }]) {
    const options = {
      config: JSON.parse(`{
        "default": true,
        "search-replace": {
          "rules": [
            {
              "name": "m-dash",
              "message": "Don't use '--'.",
              "search": "--",
              "replace": "—",
              "searchScope": "${setting}"
            }
          ]
        }
      }`),
      customRules: [searchReplace],
      resultVersion: 3,
      files: [inputFile],
    };

    t.throws(() => markdownlint.sync(options), {
      message: `Invalid value \`${setting}\` provided for \`searchScope\`, must be one of \`all\`, \`code\` or \`text\`.`,
    });
  }
});

test("checkPropertiesSearchList", (t) => {
  const inputFile2 = "./tests/data/multivalue_search.md";
  const options = {
    config: JSON.parse(`{
      "default": true,
      "search-replace": {
        "rules": [
          {
            "name": "bad-spellings",
            "message": "Incorrect spelling",
            "searchPattern": ["/e-mail/g", "/ohh no/gi", "/web site/g"],
            "replace": ["email", null, "website"],
            "skipCode": false
          }
        ]
      }
    }`),
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile2],
  };
  const expected = `./tests/data/multivalue_search.md: 3: search-replace Custom rule [bad-spellings: Incorrect spelling] [Context: "column: 34 text:'e-mail'"]
./tests/data/multivalue_search.md: 3: search-replace Custom rule [bad-spellings: Incorrect spelling] [Context: "column: 1 text:'Ohh no'"]
./tests/data/multivalue_search.md: 3: search-replace Custom rule [bad-spellings: Incorrect spelling] [Context: "column: 42 text:'web site'"]
./tests/data/multivalue_search.md: 7: search-replace Custom rule [bad-spellings: Incorrect spelling] [Context: "column: 4 text:'e-mail'"]
./tests/data/multivalue_search.md: 8: search-replace Custom rule [bad-spellings: Incorrect spelling] [Context: "column: 13 text:'web site'"]`;

  check(t, options, expected);
});
