import type { Pipeline, PipelineStage } from "vite-plugin-md";
import type { CodeBlockMeta, CodeFilename, HighlightToken } from "../../types";
import {
  hasHighlightProperty,
  hasProps,
  isObjectRangeRepresentation,
  isRangeRepresentation,
  isSymbolRepresentation,
} from "./shared";

export interface ObjectParseVariables {
  highlightTokens: HighlightToken[];
  externalFile: string | null;
  showFilename: CodeFilename;
}

/**
 * Handles parsing the meta properties that can be appended to
 * a code block when stated in an object syntax. This includes:
 *
 * 1. **JSON Parsable Object**
 * 2. **Vite/Vuepress Format** (for highlighting only)
 *
 * Note: if `undefined` is passed in for the objCandidate it will look in
 * `fence.props` for properties.
 */
export const parseObjectSyntax = (
  objCandidate: string | undefined,
  p: Pipeline<"parser">,
  fence: CodeBlockMeta<"code">
): CodeBlockMeta<"code"> => {
  // eslint-disable-next-line prefer-const
  let { highlightTokens, externalFile, showFilename } = fence;

  try {
    const props = objCandidate ? JSON.parse(objCandidate) : fence.props;
    // highlighting logic
    if (hasHighlightProperty(props)) {
      const highlight = Array.isArray(props.highlight)
        ? props.highlight
        : [props.highlight];

      for (const h of highlight) {
        switch (typeof h) {
          case "string": {
            if (isRangeRepresentation(h)) {
              const [from, to] = h.split(/\s*-\s*/).map(Number);
              highlightTokens.push({ kind: "range", from, to });
            } else {
              console.warn(
                `the "${p?.fileName}" file has a highlight token "${h}" which can't be parsed. String values are expected to be a range like: "3-6". This value will be ignored.`
              );
            }
            break;
          }
          case "number": {
            highlightTokens.push({ kind: "line", line: h });
            break;
          }
          case "object": {
            if (isSymbolRepresentation(h)) {
              highlightTokens.push({ kind: "symbol", symbol: h.symbol });
            } else if (isObjectRangeRepresentation(h)) {
              highlightTokens.push({ kind: "range", from: h.from, to: h.to });
            } else {
              console.warn(
                `the "${
                  p?.fileName
                }" file has a highlight token "${JSON.stringify(
                  h
                )}" which is not parsable. This value will be ignored.`
              );
            }

            break;
          }
          default: {
            console.warn(
              `the "${
                p?.fileName
              }" file has a highlight token which is of type "${typeof h}"; this is not parsabe and will be ignored.`
            );
          }
        }
      }
    }

    // other props
    if (hasProps(props)) {
      if (props.filename) {
        externalFile = props.filename;
      }
      if (props.showFilename) {
        showFilename = props.showFilename;
      }
    }

    return { ...fence, props, highlightTokens, showFilename, externalFile };
  } catch {
    // see if this is a Vue/Vitepress line highlighting format or throw error
    const vpressExistance = /{\s*((\d+)|(\d+-\d+)).*}/s;
    if (objCandidate && vpressExistance.test(objCandidate)) {
      // const parser = /\s*(([0-9]+)|([0-9]+-[0-9]+))\s*/m
      const tokens = objCandidate
        .replace(/\s*{/, "")
        .replace(/}\s*/, "")
        .split(",")
        .map((i) => i.trim());

      for (const t of tokens) {
        if (isRangeRepresentation(t)) {
          const [from, to] = t.split(/\s*-\s*/).map(Number);
          highlightTokens.push({ kind: "range", from, to });
        } else if (Number.isNaN(Number(t))) {
          console.warn(
            `the "${p?.fileName}" file is using Vuepress/Vitepress syntax to highlight lines but the token "${t}" is not parsable and will be ignored`
          );
        } else {
          highlightTokens.push({ kind: "line", line: Number(t) });
        }
      }

      return { ...fence, highlightTokens, showFilename, externalFile };
    } else {
      throw new Error(
        `the "${p?.fileName}" file found object-like metadata in a code block but it was neither a JSON object nor a Vue/Vitepress highlighting expression: ${objCandidate}`
      );
    }
  }
};
