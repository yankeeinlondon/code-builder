import type { CodeBlockProperties, RangeExpression } from "../../types";

export function hasHighlightProperty(props: unknown): props is CodeBlockProperties {
  return typeof props === "object" && "highlight" in (props as Object);
}

export function isRangeRepresentation(range: unknown): range is RangeExpression {
  const re = /(\d+)\s*-\s*(\d+)/;
  return typeof range === "string" && re.test(range);
}

export function isSymbolRepresentation(sym: unknown): sym is { symbol: string } {
  return typeof sym === "object" && "symbol" in (sym as Object);
}

export function isObjectRangeRepresentation(range: unknown): range is { from: number; to: number } {
  return typeof range === "object" && "from" in (range as Object) && "to" in (range as Object);
}

export function hasProps(props: unknown): props is CodeBlockProperties {
  return typeof props === "object";
}
