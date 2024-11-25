import { pipe } from "fp-ts/lib/function.js";
import type { Fragment } from "@yankeeinlondon/happy-wrapper";
import {
  before,
  changeTagName,
  createFragment,
  select,
  wrap,
} from "@yankeeinlondon/happy-wrapper";
import type { Pipeline, PipelineStage } from "vite-plugin-md";
import type { CodeBlockMeta, CodeOptions } from "../../types";
import { Modifier } from "../../types";

/**
 * in 'flex-lines' layout we'll use a strategy similar to what is used in Vite/Vuepress:
 *
 * 1. `pre` has whitespace control but not text spacing
 * 2. line numbers are displayed _after_ the code and using absolute positioning to
 * appear next to the code
 */
export const flexLines = (
  p: Pipeline<"parser">,
  o: CodeOptions,
  fence: CodeBlockMeta<"dom">
): Fragment => {
  // determine if line numbers are to be incorporated into output
  const hasLineNumbers =
    o.lineNumbers || fence.modifiers.includes(Modifier["#"]);
  const lineNumbersWrapper = hasLineNumbers
    ? fence.lineNumbersWrapper
    : createFragment();

  return pipe(
    fence.codeBlockWrapper,
    select,
    // .code-wrapper
    (s) =>
      s.update(
        ".code-block",
        `Couldn't find the ".code-wrapper" in the file ${p.fileName}`
      )((el) => (fence.heading ? before(fence.heading)(el) : el)),
    // wrap in PRE and line number sections
    (s) =>
      s.update(
        ".code-block",
        `Couldn't find the ".code-block" in the file ${p.fileName}`
      )(wrap(fence.pre, lineNumbersWrapper)),
    // we'll use DIV's -- a block element -- to give PRE's whitespace
    // property jurisdiction to create a new line
    // whereas with Prism's output we're just getting SPANs
    (s) => s.updateAll(".code-line")(changeTagName("code")),
    (s) => s.toContainer()
  );
};
