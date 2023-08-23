"use strict";

const fs = require("node:fs");
const helper = require("markdownlint-rule-helpers");
const markdownlint = require("markdownlint");

const fsOptions = { encoding: "utf8" };
const dataPath = "./tests/data/";
const INFO_URL =
  "https://github.com/OnkarRuikar/markdownlint-rule-search-replace";

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
    "Output doesn't match.",
  );
}

function checkRuleInformation(executionContext, options) {
  const ruleInfoMap = new Map();
  for (const rule of options.config["search-replace"].rules) {
    if (rule.information === undefined) {
      ruleInfoMap.set(`${rule.name}: ${rule.message}`, INFO_URL);
    } else {
      ruleInfoMap.set(`${rule.name}: ${rule.message}`, rule.information);
    }
  }

  const results = markdownlint.sync(options);
  for (const file of Object.keys(results)) {
    const fileErrors = results[file];
    for (const error of fileErrors) {
      executionContext.is(
        error.ruleInformation,
        ruleInfoMap.get(error.errorDetail),
        `Information URL doesn't match for rule: ${error.errorDetail}`,
      );
    }
  }
}

module.exports.check = check;
module.exports.checkFix = checkFix;
module.exports.checkRuleInformation = checkRuleInformation;
