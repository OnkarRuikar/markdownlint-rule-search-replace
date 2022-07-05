// @ts-check

"use strict";

module.exports = {
  names: ["search-replace"],
  description: "Custom rule",
  information: new URL("https://github.com/OnkarRuikar/markdownlint-rule-search-replace"),
  tags: ["replace"],

  function: (params, onError) => {
    const content = params.lines.join("\n");

    if (Array.isArray(params.config)) {
      params.config.forEach((rule) => {
        const regex = stringToRegex(rule.search || rule.search_pattern);

        let result;
        while ((result = regex.exec(content)) !== null) {
          const match = result[0];
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
    }
  },
};

const escapeForRegExp = (str) => {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const stringToRegex = (str) => {
  let pattern = (str.match(/\/(.+)\/.*/) || [])[1];
  if (!pattern) {
    pattern = escapeForRegExp(str);
  }

  const flags = (str.match(/\/.+\/(.*)/) || [, "g"])[1];

  return new RegExp(pattern, flags);
};

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
