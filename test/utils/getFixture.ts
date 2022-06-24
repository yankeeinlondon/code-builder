import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getFixture(file: string): Promise<string> {
  const filepath = file.includes("fixtures")
    ? file.endsWith(".md") ? file : `${file}.md`
    : join(process.cwd(), "test/fixtures", file.endsWith(".md") ? file : `${file}.md`);

  try {
    const content = await readFile(filepath, "utf8");

    return content;
  } catch (error) {
    throw new Error(`Problem loading the Markdown fixture: ${filepath}!\n\n${error instanceof Error ? error.message : String(error)}`);
  }
}
