import type { Pipeline, PipelineStage } from "vite-plugin-md";
import type { CodeBlockMeta } from "../../types";

function extractTypedValuesFromCSV(
  value: string
): string | number | boolean | any[] | Object {
  return value.startsWith('"')
    ? value.endsWith('"')
      ? value.slice(1, -1)
      : value.slice(1)
    : value.startsWith("{")
    ? JSON.stringify(value)
    : value.startsWith("[")
    ? (value
        .replace(/[[\]]/g, "")
        .split(";;")
        .map((v2) => extractTypedValuesFromCSV(v2)) as any[])
    : value === "true"
    ? true
    : value === "false"
    ? false
    : Number.isNaN(value)
    ? value
    : Number(value);
}

function protectArrays(csv: string) {
  if (csv.includes("[")) {
    const parts = csv.split("[").map((p) => {
      if (p.includes("]")) {
        const [inside, after] = p.split("]");
        return `${inside.replace(/,/g, ";;")}]${after}`;
      } else {
        return p;
      }
    });
    return parts.join("[");
  }

  return csv;
}

/**
 * parses CSV values to set the `props` property
 */
export const parseCSVSyntax = (
  csv: string,
  _p: Pipeline<"parser">,
  fence: CodeBlockMeta<"code">
): CodeBlockMeta<"code"> => {
  csv = protectArrays(csv);
  fence.props = csv.split(",").reduce((acc, i) => {
    const [key, ...rest] = i.trim().split(/[:=]/);
    return {
      ...acc,
      [key.trim()]: extractTypedValuesFromCSV(rest.join(",").trim()),
    };
  }, {});

  return fence;
};
