"use strict";

const test = require("ava").default;
const markdownlint = require("markdownlint");
const searchReplace = require("../rule");
const applyFixes = require("./utils").applyFixes;

const inputFile = "./tests/data/options-tests.md";

test("applyFixDefault", (t) => {
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
      "applyFixDefault.out.md"
    ),
    "Output doesn't match."
  );
});

test("applyFixRegex", (t) => {
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
  t.is(
    ...applyFixes(inputFile, markdownlint.sync(options), "applyFixRegex.out.md"),
    "Output doesn't match."
  );
});

test("applyFixSkipCode", (t) => {
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
  t.is(
    ...applyFixes(
      inputFile,
      markdownlint.sync(options),
      "applyFixSkipCode.out.md"
    ),
    "Output doesn't match."
  );
});
