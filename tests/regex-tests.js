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
