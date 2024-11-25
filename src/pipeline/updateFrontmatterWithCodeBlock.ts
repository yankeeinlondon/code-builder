import type { CodeBlockMeta, CodeBlockSummary, CodeOptions } from "../types";
import type { Pipeline } from "vite-plugin-md";
import { highlightTokensToLines } from "../utils";

export const updateFrontmatterWithCodeBlock =
  <P extends Pipeline<"parser", any>>(p: P, o: CodeOptions) =>
  (fence: CodeBlockMeta<"dom">): CodeBlockMeta<"dom"> => {
    if (o.injectIntoFrontmatter) {
      const info: CodeBlockSummary = {
        source: fence.props.filename,
        requestedLang: fence.requestedLang,
        parsedLang: fence.lang,
        props: fence.props,
        codeLines: fence.codeLinesCount,
        linesHighlighted: highlightTokensToLines(fence),
      };
      // mutate frontmatter to include code block info
      p.frontmatter = {
        ...p.frontmatter,
        _codeBlocks: p.frontmatter._codeBlocks
          ? [...(p.frontmatter._codeBlocks as CodeBlockSummary[]), info]
          : [info],
      };
    }

    return fence;
  };
