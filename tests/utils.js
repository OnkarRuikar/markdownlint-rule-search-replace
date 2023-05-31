"use strict";

const fs = require("node:fs");
const helper = require("markdownlint-rule-helpers");
const markdownlint = require("markdownlint");

const fsOptions = { encoding: "utf8" };
const dataPath = "./tests/data/";

function check(executionContext, options, expected) {
  const result = markdownlint.sync(options);
  executionContext.is(result.toString(), expected, "Unexpected result.");
}

function applyFixes(file, result, expected) {
  const originalText = fs.readFileSync(file, fsOptions);
  const fixes = result[file].filter((error) => error.fixInfo);
  result = helper.applyFixes(originalText, fixes);
  expected = fs.readFileSync(dataPath + expected, fsOptions);
  return [expected, result];
}

function checkFix(executionContext, options, inputFile, outputFile) {
  executionContext.is(
    ...applyFixes(inputFile, markdownlint.sync(options), outputFile),
    "Output doesn't match."
  );
}

module.exports.check = check;
module.exports.checkFix = checkFix;
