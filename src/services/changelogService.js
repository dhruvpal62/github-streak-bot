import { readFile } from "node:fs/promises";
import { fileExists, writeText } from "../utils/fs.js";

const CHANGELOG_PATH = "CHANGELOG.md";

export class ChangelogService {
  async appendEntry(date, topics, files) {
    const current = await this.readCurrent();
    const entry = `\n## ${date}\n\n- Refreshed scheduled maintenance artifacts.\n- Updated focus areas: ${topics.join(", ")}.\n- Touched ${files.length} generated project file(s).\n`;

    if (current.includes(`## ${date}`)) {
      return;
    }

    await writeText(CHANGELOG_PATH, `${current.trim()}\n${entry}\n`);
  }

  async readCurrent() {
    if (!(await fileExists(CHANGELOG_PATH))) {
      return "# Changelog\n\nAll notable scheduled maintenance updates are recorded here.\n";
    }
    return readFile(CHANGELOG_PATH, "utf8");
  }
}
