// @ts-check

"use strict";

const test = require("ava").default;
const markdownlint = require("markdownlint");
const searchReplace = require("../rule");

const inputFile = "./tests/data/options-tests.md";

test("checkPropertiesDefault", (t) => {
  const options = {
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
    resultVersion: 3,
    files: [inputFile],
  };
  const result = markdownlint.sync(options);
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 1 text:'--'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 6 text:'--'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 11 text:'--'"]
./tests/data/options-tests.md: 6: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 18 text:'--'"]
./tests/data/options-tests.md: 9: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 15 text:'--'"]`;
  t.is(result.toString(), expected, "Unexpected result.");
});

test("checkPropertiesRegex", (t) => {
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "m-dash",
            message: "Don't use '--'.",
            searchPattern: "/--/g",
            replace: "—",
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };
  const result = markdownlint.sync(options);
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 1 text:'--'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 6 text:'--'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 11 text:'--'"]
./tests/data/options-tests.md: 6: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 18 text:'--'"]
./tests/data/options-tests.md: 9: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 15 text:'--'"]`;
  t.is(result.toString(), expected, "Unexpected result.");
});

test("checkPropertiesSkipCode", (t) => {
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "m-dash",
            message: "Don't use '--'.",
            search: "--",
            replace: "—",
            skipCode: true,
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };
  const result = markdownlint.sync(options);
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 1 text:'--'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 6 text:'--'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [m-dash: Don't use '--'.] [Context: "column: 11 text:'--'"]`;
  t.is(result.toString(), expected, "Unexpected result.");
});
