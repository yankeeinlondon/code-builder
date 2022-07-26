import { createBuilder } from "@yankeeinlondon/builder-api";
import type { CodeOptions } from "./types";
import { fence } from "./mdi";

/**
 * `code` Builder API
 *
 * Provides highlighting of code features to `vite-plugin-md`
 */
export const plugin = createBuilder("code", "parser")
  .options<Partial<CodeOptions>>()
  .initializer()
  .handler(async (p, o) => {
    // ensure proper defaults for options
    const options = {
      highlightLines: true,
      lineNumbers: false,
      showLanguage: true,
      clipboard: false,
      injectIntoFrontmatter: false,
      lineClass: "code-line",
      headingClasses: ["heading"],
      footerClasses: ["footer"],
      layoutStructure: "flex-lines",
      defaultLanguageForUnknown: "markdown",
      defaultLanguageForUnspecified: "markdown",
      ...o,
    } as CodeOptions;

    p.parser.use(await fence(p, options));

    return p;
  })
  .meta({
    description:
      "Provides highlighted code blocks via Prism or Shiki styling ecosystems",
    parserRules: [{ ruleName: "fence", usage: "patches" }],
  });
