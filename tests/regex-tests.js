"use strict";

const test = require("ava").default;
const searchReplace = require("../rule");
const checkFix = require("./utils").checkFix;
const check = require("./utils").check;

test("htmlCommentFix", (t) => {
  const inputFile = "./tests/data/html_comment-tests.md";
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

  checkFix(t, options, inputFile, "htmlCommentFix.out.md");
});

test("searchRegexFix", (t) => {
  const inputFile = "./tests/data/search_regex-tests.md";
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "use-case-insensitive",
            message: "Use 'i' flag.",
            search: "/abc/g",
            replace: "/abc/ig",
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };

  checkFix(t, options, inputFile, "search_regex-tests.out.md");
});

test("replaceLineFix", (t) => {
  const inputFile = "./tests/data/replaceLine-tests.md";
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "test",
            message: "test",
            searchPattern: "^/\\.\\.\\.(.*)\\.\\.\\.$/mg",
            replace: "-- $1 --",
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };

  checkFix(t, options, inputFile, "replaceLineFix.out.md");
});

test("multilineSearch", (t) => {
  const inputFile = "./tests/data/options-tests.md";
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "test",
            message: "test",
            searchPattern: "/some text\\nsome -- text\\nsome/mg",
            replace: "not applicable",
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile],
  };
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [test: test] [Context: "column: 4 text:'some text'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [test: test] [Context: "column: 1 text:'some -- text'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [test: test] [Context: "column: 1 text:'some'"]`;

  check(t, options, expected);
});
