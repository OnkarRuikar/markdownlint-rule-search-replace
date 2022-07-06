// @ts-check

"use strict";


module.exports = {
  names: ["search-replace"],
  description: "Custom rule",
  information: new URL("https://github.com/OnkarRuikar/markdownlint-rule-search-replace"),
  tags: ["replace"],

  function: (params, onError) => {
    if(!params.config.rules) {
      return;
    }

    const content = params.lines.join("\n");
    const [backticksData, htmlCommentData] = gatherInfo(content);

    params.config.rules.forEach((rule) => {
      const regex = stringToRegex(rule.search || rule.search_pattern);

      let result;
      while ((result = regex.exec(content)) !== null) {
        const match = result[0];

        if(rule.skip_code && isCode(result.index, backticksData)) {
           continue;
        }

        if(isHTMLComment(result.index, htmlCommentData)) {
          continue;
        }

        const [lineNo, columnNo] = getLocation(params.lines, result.index);

        let replacement = "";
        if (rule.search) {
          replacement = rule.replace;
        } else {
          replacement = match.replace(new RegExp(regex), rule.replace);
        }

        onError({
          lineNumber: lineNo,
          detail: rule.name + ": " + rule.message,
          context: match,
          range: [columnNo + 1, match.length],
          fixInfo: {
            lineNumber: lineNo,
            editColumn: columnNo + 1,
            deleteCount: match.length,
            insertText: replacement,
          },
        });
      }
    });
  },
};


const escapeForRegExp = (str) => {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};


/**
 * Converts string "/abc/ig" to new RegEx("abc", "ig").
 * Or
 * Converts string "abc" to new RegEx("abc", "g").
 */
const stringToRegex = (str) => {
  let pattern = (str.match(/\/(.+)\/.*/) || [])[1];
  if (!pattern) {
    pattern = escapeForRegExp(str);
  }

  const flags = (str.match(/\/.+\/(.*)/) || [, "g"])[1];

  return new RegExp(pattern, flags);
};


/**
 * Given position in the document returns line and column number.
 */
const getLocation = (lines, pos) => {
  let lineNo = 1;

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
 */
const gatherInfo = (content) => {
  const backtickRgx = /`+/g;
  const backticksData = [];
  let match = null;
  let lastLength = null;
  while ((match = backtickRgx.exec(content)) !== null) {
    const length = match[0].length;
    const pos = match.index;

    if(!lastLength) {
      backticksData.push([length, pos]);
      lastLength = length;
    } else if(lastLength === length) {
      backticksData.push([length, pos]);
      lastLength = null;
    }
  }

  const htmlCommentRgx = /<!--|-->/g;
  const htmlCommentData = [];
  while ((match = htmlCommentRgx.exec(content)) !== null) {
    htmlCommentData.push([match[0].length, match.index]);
  }

  return [backticksData, htmlCommentData];
};


/**
 * Tells if the position lies inside a code block.
 */
const isCode = (pos, data) => {
  return isPartOf(pos, data);
};


/**
 * Tells if the position lies inside an HTML comment.
 */
const isHTMLComment = (pos, data) => {
  return isPartOf(pos, data);
};


/**
 * Tells if the position lies inside any block in the 'data' array.
 */
const isPartOf = (pos, data) => {
  for(let i = 0; i < data.length; i+=2 ) {
    const start = data[i][1];
    const end = data[i+1][0] + data[i+1][1];
    if(start <= pos && pos <= end ) {
      return true;
    }
  }

  return false;
};
