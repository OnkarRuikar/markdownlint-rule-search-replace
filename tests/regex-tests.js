"use strict";

const test = require("ava").default;
const markdownlint = require("markdownlint");
const searchReplace = require("../rule");
const applyFixes = require("./utils").applyFixes;

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
  t.is(
    ...applyFixes(
      inputFile,
      markdownlint.sync(options),
      "htmlCommentFix.out.md"
    ),
    "Output doesn't match."
  );
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
  t.is(
    ...applyFixes(
      inputFile,
      markdownlint.sync(options),
      "search_regex-tests.out.md"
    ),
    "Output doesn't match."
  );
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
  t.is(
    ...applyFixes(
      inputFile,
      markdownlint.sync(options),
      "replaceLineFix.out.md"
    ),
    "Output doesn't match."
  );
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
  const result = markdownlint.sync(options);
  const expected = `./tests/data/options-tests.md: 3: search-replace Custom rule [test: test] [Context: "column: 4 text:'some text'"]
./tests/data/options-tests.md: 4: search-replace Custom rule [test: test] [Context: "column: 1 text:'some -- text'"]
./tests/data/options-tests.md: 5: search-replace Custom rule [test: test] [Context: "column: 1 text:'some'"]`;
  t.is(result.toString(), expected, "Unexpected result.");
});
