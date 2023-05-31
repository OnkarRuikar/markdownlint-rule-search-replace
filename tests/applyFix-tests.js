"use strict";

const test = require("ava").default;
const searchReplace = require("../rule");
const checkFix = require("./utils").checkFix;

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

  checkFix(t, options, inputFile, "applyFixDefault.out.md");
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

  checkFix(t, options, inputFile, "applyFixRegex.out.md");
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

  checkFix(t, options, inputFile, "applyFixSkipCode.out.md");
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

  checkFix(t, options, inputFile2, "applyFixReplaceBackticks.out.md");
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

  checkFix(t, options, inputFile, "options-tests.md");
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

  checkFix(t, options, inputFile, "options-tests.md");
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
            replace: ["email", null, "website"],
            skipCode: false,
          },
        ],
      },
    },
    customRules: [searchReplace],
    resultVersion: 3,
    files: [inputFile2],
  };

  checkFix(t, options, inputFile2, "applyMultivalueFixDefault.out.md");
});

test("applyFixOnSearchListRegex", (t) => {
  const inputFile2 = "./tests/data/multivalue_search.md";
  for (const noReplacement of [undefined, null]) {
    const options = {
      config: {
        default: true,
        "search-replace": {
          rules: [
            {
              name: "bad-spellings",
              message: "Incorrect spelling",
              searchPattern: ["/e-mail/g", "/ohh no/gi", "/web site/g"],
              replace: ["email", noReplacement, "website"],
              skipCode: false,
            },
          ],
        },
      },
      customRules: [searchReplace],
      resultVersion: 3,
      files: [inputFile2],
    };
    checkFix(t, options, inputFile2, "applyMultivalueFixDefault.out.md");
  }
});
