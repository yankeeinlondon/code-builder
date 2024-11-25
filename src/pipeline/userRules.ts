import type { Pipeline } from "vite-plugin-md";
import type { CodeBlockMeta, CodeOptions } from "../types";

/**
 * Provides a before/after hook that consumers can use to tie into the
 * mutation pipeline for `code()` builder
 */
export const userRules =
  <W extends "before" | "after">(
    when: W,
    p: Pipeline<"parser">,
    o: CodeOptions
  ) =>
  (fence: CodeBlockMeta<W extends "before" ? "code" : "dom">) => {
    return (o[when] ? o[when](fence as any, p, o) : fence) as CodeBlockMeta<
      W extends "before" ? "code" : "dom"
    >;
  };
