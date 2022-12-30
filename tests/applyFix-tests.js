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
            message: "Don't use '--'",
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
            message: "Don't use '--'",
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
    ...applyFixes(
      inputFile,
      markdownlint.sync(options),
      "applyFixRegex.out.md"
    ),
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
            message: "Don't use '--'",
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

test("applyFixReplaceBackticks", (t) => {
  const inputFile2 = "./tests/data/applyFixReplaceBackticks.md";
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "m-dash",
            message: "Don't use '--'",
            search: "````",
            replace: "```",
            skipCode: true,
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile2],
  };
  t.is(
    ...applyFixes(
      inputFile2,
      markdownlint.sync(options),
      "applyFixReplaceBackticks.out.md"
    ),
    "Output doesn't match."
  );
});

test("applyFixWithoutReplace", (t) => {
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "m-dash",
            message: "Don't use '--'",
            search: "--",
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
    ...applyFixes(inputFile, markdownlint.sync(options), "options-tests.md"),
    "Output doesn't match."
  );
});

test("applyPatternFixWithoutReplace", (t) => {
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "m-dash",
            message: "Don't use '--'",
            searchPattern: "/--/g",
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
    ...applyFixes(inputFile, markdownlint.sync(options), "options-tests.md"),
    "Output doesn't match."
  );
});

test("applyFixOnSearchListDefault", (t) => {
  const inputFile2 = "./tests/data/multivalue_search.md";
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "bad-spellings",
            message: "Incorrect spelling",
            search: ["e-mail", "ohh no", "web site"],
            // eslint-disable-next-line no-sparse-arrays
            replace: ["email", , "website"],
            skipCode: false,
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile2],
  };
  t.is(
    ...applyFixes(
      inputFile2,
      markdownlint.sync(options),
      "applyMultivalueFixDefault.out.md"
    ),
    "Output doesn't match."
  );
});

test("applyFixOnSearchListRegex", (t) => {
  const inputFile2 = "./tests/data/multivalue_search.md";
  const options = {
    config: {
      default: true,
      "search-replace": {
        rules: [
          {
            name: "bad-spellings",
            message: "Incorrect spelling",
            searchPattern: ["/e-mail/g", "/ohh no/gi", "/web site/g"],
            // eslint-disable-next-line no-sparse-arrays
            replace: ["email", , "website"],
            skipCode: false,
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile2],
  };
  t.is(
    ...applyFixes(
      inputFile2,
      markdownlint.sync(options),
      "applyMultivalueFixDefault.out.md"
    ),
    "Output doesn't match."
  );
});
