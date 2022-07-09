"use strict";

const fs = require("node:fs");
const helper = require("markdownlint-rule-helpers");

const fsOptions = { encoding: "utf8" };
const dataPath = "./tests/data/";

function applyFixes(file, result, expected) {
  const originalText = fs.readFileSync(file, fsOptions);
  const fixes = result[file].filter((error) => error.fixInfo);
  result = helper.applyFixes(originalText, fixes);
  expected = fs.readFileSync(dataPath + expected, fsOptions);
  return [result, expected];
}

module.exports.applyFixes = applyFixes;
