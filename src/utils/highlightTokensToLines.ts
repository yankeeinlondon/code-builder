import type { CodeBlockMeta } from "../types";

/** converts HighlightTokens to lines of code */
export function highlightTokensToLines(fence: CodeBlockMeta<"dom">): number[] {
  const lines: number[] = [];

  for (const t of fence.highlightTokens) {
    switch (t.kind) {
      case "line":
        lines.push(t.line);
        break;
      case "range":
        {
          let i = t.from;
          while (i <= t.to) {
            lines.push(i);
            i++;
          }
        }
        break;
      case "symbol":
        // TODO: need to implement this
    }
  };

  return lines;
}
