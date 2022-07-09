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
  let pattern = (str.match(/\/(.+)\/.*/) || [])[1];
  if (!pattern) {
    pattern = escapeForRegExp(str);
  }

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
  const regex = /<!--[.\n]*-->/gm;
  const ranges = [];
  let match = null;
  while ((match = regex.exec(content)) !== null) {
    const pos = getLocation(match.index, lines);

    if (match[0].includes("\n")) {
      const parts = match[0].split("\n");
      for (const [i, p] of parts.entries()) {
        if (i === 0) {
          ranges.push([...pos, p.length]);
        } else {
          ranges.push([pos[0] + i, 0, p.length]);
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

module.exports = {
  names: ["search-replace"],
  description: "Custom rule",
  information: new URL(
    "https://github.com/OnkarRuikar/markdownlint-rule-search-replace"
  ),
  tags: ["replace"],

  function: (params, onError) => {
    if (!params.config.rules) {
      return;
    }

    const content = params.lines.join("\n");
    const lineMetadata = helpers.getLineMetadata(params);
    const codeRanges = helpers.codeBlockAndSpanRanges(params, lineMetadata);
    const htmlCommentRanges = gatHtmlCommentRanges(content, params.lines);

    for (const rule of params.config.rules) {
      const regex = stringToRegex(rule.search || rule.searchPattern);

      let result = null;
      while ((result = regex.exec(content)) !== null) {
        if (rule.skipCode && isCode(result.index, codeRanges, params.lines)) {
          continue;
        }

        if (isHTMLComment(result.index, htmlCommentRanges, params.lines)) {
          continue;
        }

        const match = result[0];
        const [lineNo, columnNo] = getLocation(result.index, params.lines);

        let replacement = "";
        replacement = rule.search
          ? rule.replace
          : match.replace(new RegExp(regex), rule.replace);

        onError({
          lineNumber: lineNo + 1,
          detail: rule.name + ": " + rule.message,
          context: `column: ${columnNo + 1} text:'${match}'`,
          range: [columnNo + 1, match.length],
          fixInfo: {
            lineNumber: lineNo + 1,
            editColumn: columnNo + 1,
            deleteCount: match.length,
            insertText: replacement,
          },
        });
      }
    }
  },
};
