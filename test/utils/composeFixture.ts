import { Narrowable } from "inferred-types";
import { composeSfcBlocks, Options } from "vite-plugin-md";
import { getFixture } from "./getFixture";

/**
 * Test util to help pickup a Markdown file from fixtures folder and have it parsed
 * using `composeSfcBlocks()`
 */
export const composeFixture = async <O extends Narrowable & Options<any>>(
  fixture: string,
  options?: O
) => {
  fixture = fixture.endsWith(".md")
    ? `./test/fixtures/${fixture}`
    : `./test/fixtures/${fixture}.md`;

  const md = await getFixture(fixture);

  return composeSfcBlocks(fixture, md, options);
};
