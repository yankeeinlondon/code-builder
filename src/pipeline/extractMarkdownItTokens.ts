import { readFileSync } from "node:fs";
import { dirname, join } from "pathe";
import { toHtml } from "@yankeeinlondon/happy-wrapper";
import type { Pipeline } from "vite-plugin-md";
import type { CodeBlockMeta, Modifier } from "../types";
import { parseCSVSyntax, parseObjectSyntax } from "./markdownItTokens";

/** takes code blocks top-line defn and extracts any ref to `<<<` file refs */
function extractVPressFileSyntax(meta: string) {
  const [front, back] = meta.split("<<<");
  return [front.trim(), back ? back.trim() : null] as [string, string | null];
}

function loadFile(codeFile: string, pipeline: Pipeline<"parser">) {
  const { fileName } = pipeline;
  codeFile = codeFile.replace(/^[@~]\//, "/");

  const pathToCode = codeFile.startsWith("/")
    ? join(process.cwd(), codeFile)
    : join(dirname(fileName), codeFile);
  try {
    return readFileSync(pathToCode, "utf8");
  } catch {
    throw new Error(
      `Problem loading external code file: \'${pathToCode}\' which was composed of [ \'${
        codeFile.startsWith("/") ? process.cwd() : dirname(fileName)
      }\', \'${codeFile}\' ]`
    );
  }
}

/**
 * Converts the Markdown-IT _tokens_ into a `CodeBlockMeta` data structure
 * which includes the language, modifiers, props, and code block.
 */
export function extractMarkdownItTokens(
  p: Pipeline<"parser">,
  t: any
): CodeBlockMeta<"code"> {
  const [info, vuepressFile] = extractVPressFileSyntax(t.info);
  const matches = info.trim().match(/(([!#*]){0,2})(\w+)\s*({.*}){0,1}(.*)$/);

  let fence = {
    pre: "",
    codeBlockWrapper: "",
    lineNumbersWrapper: "",

    code: t.content,
    level: t.level,
    tag: t.tag,
    highlightTokens: [],
    externalFile: vuepressFile || null,
    showFilename: false,
    lang: info,
    props: {},
    modifiers: [],
    markup: t.markup,
  } as unknown as CodeBlockMeta<"code">;

  // match on meta-data found to the right of language
  if (matches) {
    const [, modifiers, , lang, obj, csv] = matches;

    if (obj) {
      fence = parseObjectSyntax(obj, p, fence);
    } else if (csv) {
      fence = parseObjectSyntax(undefined, p, parseCSVSyntax(csv, p, fence));
    }

    if (modifiers) {
      fence.modifiers = [...modifiers] as Modifier[];
    }

    if (lang) {
      fence.lang = lang;
    }
  }

  if (fence.externalFile) {
    fence = {
      ...fence,
      code: loadFile(fence.externalFile, p),
      aboveTheFoldCode: toHtml(`\n${fence.code}\n`),
    };
  }

  return {
    ...fence,
    trace: `MarkdownIt tokens parsed: [\n  lang: ${
      fence.lang
    },\n  externalFile: ${fence.externalFile},\n  highlight: ${JSON.stringify(
      fence.highlightTokens
    )} \n]\nProps:${JSON.stringify(fence.props, null, 2)}`,
  };
}
