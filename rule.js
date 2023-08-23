// @ts-check

"use strict";

const helpers = require("markdownlint-rule-helpers");

const escapeForRegExp = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

/**
 * Converts string "/abc/ig" to new RegEx("abc", "ig").
 * Or
 * Converts string "abc" to new RegEx("abc", "g").
 *
 * @param {string} str A regex string.
 * @returns {RegExp} A RegExp object.
 */
const stringToRegex = (str) => {
  const pattern = (str.match(/\/(.+)\/.*/) || ["", "a^"])[1];
  const flags = (str.match(/\/.+\/(.*)/) || ["", "g"])[1];
  return new RegExp(pattern, flags);
};

/**
 * Given position in the document returns line and column number.
 *
 * @param {number} pos Position in the document.
 * @param {string[]} lines An array of lines.
 * @returns {number[]} Line number and column of the position.
 */
const getLocation = (pos, lines) => {
  let lineNo = 0;
  for (const line of lines) {
    pos -= line.length + 1;
    if (pos < 0) {
      return [lineNo, line.length + 1 + pos];
    }
    lineNo++;
  }
  return [lines.length, 0];
};

/**
 * Collect start and end position data of all code fences and html comments.
 *
 * @param {string} content Entire document text.
 * @param {string[]} lines An array of lines in the document.
 * @returns {number[][]} An array of tuple [lineNo, column, length].
 */
const gatHtmlCommentRanges = (content, lines) => {
  const regex = /<!--[.\n\s]*-->/gm;
  const ranges = [];
  let match = null;
  while ((match = regex.exec(content)) !== null) {
    const pos = getLocation(match.index, lines);

    if (match[0].includes("\n")) {
      const parts = match[0].split("\n");
      for (const [i, part] of parts.entries()) {
        if (i === 0) {
          ranges.push([...pos, part.length]);
        } else {
          ranges.push([pos[0] + i, 0, part.length]);
        }
      }
    } else {
      ranges.push([...pos, match[0].length]);
    }
  }
  return ranges;
};

/**
 * Tells if the position lies inside any range.
 *
 * @param {number} pos Position in the document.
 * @param {number[][]} ranges Array of tuple [lineNo, column, length].
 * @param {string[]} lines Array of lines.
 * @returns {boolean} Whether the position lies in any range.
 */
const isPartOf = (pos, ranges, lines) => {
  for (const [rLine, rColumn, rLength] of ranges) {
    const [line, column] = getLocation(pos, lines);
    if (rLine === line && rColumn <= column && column <= rColumn + rLength) {
      return true;
    }
  }
  return false;
};

/**
 * Tells if the position lies inside a code block.
 *
 * @param {number} pos Position in the document.
 * @param {number[][]} ranges Array of tuple [lineNo, column, length].
 * @param {string[]} lines Array of lines.
 * @returns {boolean} Whether the position lies in any range.
 */
const isCode = (pos, ranges, lines) => isPartOf(pos, ranges, lines);

/**
 * Tells if the position lies inside an HTML comment.
 *
 * @param {number} pos Position in the document.
 * @param {number[][]} ranges Array of tuple [lineNo, column, length].
 * @param {string[]} lines Array of lines.
 * @returns {boolean} Whether the position lies in any range.
 */
const isHTMLComment = (pos, ranges, lines) => isPartOf(pos, ranges, lines);

/**
 * Check rule definition.
 *
 * @param {Object} rule A rule object.
 * @throws {Error} The error in rule definition.
 */
const validateRule = (rule) => {
  if (!rule.search && !rule.searchPattern) {
    throw new Error("Provide either `search` or `searchPattern` option.");
  }

  if (rule.searchScope !== undefined) {
    if (rule.skipCode !== undefined) {
      throw new Error(
        "Both `searchScope` and `skipCode` specified, `skipCode` is deprecated, use `searchScope` instead.",
      );
    }

    if (!["all", "code", "text"].includes(rule.searchScope)) {
      throw new Error(
        `Invalid value \`${rule.searchScope}\` provided for \`searchScope\`, must be one of \`all\`, \`code\` or \`text\`.`,
      );
    }
  }
};

module.exports = {
  names: ["search-replace"],
  description: "Custom rule",
  information: new URL(
    "https://github.com/OnkarRuikar/markdownlint-rule-search-replace",
  ),
  tags: ["replace"],

  function: (params, onError) => {
    const report = (rule, match, lineNo, columnNo, replacement) => {
      const options = {
        lineNumber: lineNo + 1,
        detail: rule.name + ": " + rule.message,
        context: `column: ${columnNo + 1} text:'${match}'`,
        range: [columnNo + 1, match.length],
      };

      if (replacement !== undefined && replacement !== null) {
        options.fixInfo = {
          lineNumber: lineNo + 1,
          editColumn: columnNo + 1,
          deleteCount: match.length,
          insertText: replacement,
        };
      }
      onError(options);
    };

    if (!params.config.rules) {
      return;
    }

    let rules = params.config.rules;
    const content = params.lines.join("\n");
    const lineMetadata = helpers.getLineMetadata(params);
    const codeRanges = helpers.codeBlockAndSpanRanges(params, lineMetadata);
    const htmlCommentRanges = gatHtmlCommentRanges(content, params.lines);

    // expand multivalue rules
    const listRules = [];
    for (const rule of rules) {
      if (
        (rule.search && Array.isArray(rule.search)) ||
        (rule.searchPattern && Array.isArray(rule.searchPattern))
      ) {
        listRules.push(rule);
      }
    }
    rules = rules.filter((r) => !listRules.includes(r));
    for (const rule of listRules) {
      if (rule.search) {
        for (const [index, word] of rule.search.entries()) {
          const clone = { ...rule };
          clone.search = word;
          clone.replace = rule.replace[index];
          rules.push(clone);
        }
      } else if (rule.searchPattern) {
        for (const [index, pattern] of rule.searchPattern.entries()) {
          const clone = { ...rule };
          clone.searchPattern = pattern;
          clone.replace = rule.replace[index];
          rules.push(clone);
        }
      }
    }

    for (const rule of rules) {
      validateRule(rule);

      const regex = rule.search
        ? new RegExp(escapeForRegExp(rule.search), "g")
        : stringToRegex(rule.searchPattern);
      let result = null;
      while ((result = regex.exec(content)) !== null) {
        if (isCode(result.index, codeRanges, params.lines)) {
          if (rule.skipCode || rule.searchScope === "text") continue;
        } else if (rule.searchScope === "code") continue;

        if (isHTMLComment(result.index, htmlCommentRanges, params.lines)) {
          continue;
        }

        const match = result[0];
        const [lineNo, columnNo] = getLocation(result.index, params.lines);

        // The parent project 'markdownlint' processes markdown line by line.
        // It doesn't allow multiline fixes. The line ending('\n') can't be removed from plugins.
        // That is why when the 'match' is multiline we can't suggest fix for it.
        // However, we can report error for each line.
        if (match.includes("\n")) {
          const parts = match.split("\n");
          for (const [i, part] of parts.entries()) {
            if (i === 0) {
              report(rule, part, lineNo, columnNo);
            } else {
              report(rule, part, lineNo + i, 0);
            }
          }
        } else {
          let replacement = null;
          if (rule.replace !== undefined && rule.replace !== null) {
            replacement = rule.search
              ? rule.replace
              : match.replace(new RegExp(regex), rule.replace);
          }
          report(rule, match, lineNo, columnNo, replacement);
        }
      }
    }
  },
};
