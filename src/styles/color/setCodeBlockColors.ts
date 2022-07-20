import type { InlineStyle } from "@yankeeinlondon/happy-wrapper";
import type { CodeBlockMeta, CodeOptions } from "../../types";
import { themes } from "./color-themes";
import type { CodeColorTheme } from "./color-types";
import { left, right } from "./mergeColorThemes";

/**
 * Sets the color palette for light and dark mode as CSS variables
 */
export const setCodeBlockColors = (
  style: InlineStyle,
  options: CodeOptions,
  props: CodeBlockMeta<"dom">["props"]
) => {
  const { theme, invertColorMode } = options;
  const defn = typeof theme === "string" ? themes[theme] : theme;

  const inversion = props.inversion
    ? props.invertColorMode === true
    : invertColorMode === true;

  if (defn) {
    for (const prop of Object.keys(defn)) {
      const light = !inversion
        ? left(defn[prop as keyof CodeColorTheme<any>])
        : right(defn[prop as keyof CodeColorTheme<any>]);
      const dark = !inversion
        ? right(defn[prop as keyof CodeColorTheme<any>])
        : left(defn[prop as keyof CodeColorTheme<any>]);
      if (light) {
        style.addCssVariable(`prism-${prop}`, light);
      }
      if (dark) {
        style.addCssVariable(`prism-${prop}`, dark, "html.dark");
      }

      style.addClassDefinition(`.token.${prop}`, (c) =>
        c.addProps({
          color: `var(--prism-${prop})`,
        })
      );
    }
  }

  return style;
};
