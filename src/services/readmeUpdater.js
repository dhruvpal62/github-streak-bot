import { readFile } from "node:fs/promises";
import { fileExists, writeText } from "../utils/fs.js";

const README_PATH = "README.md";
const START = "<!-- GITHUB_STREAK_BOT:START -->";
const END = "<!-- GITHUB_STREAK_BOT:END -->";

export class ReadmeUpdater {
  async update(stats, report, localTime) {
    const section = `${START}
| Metric | Value |
| --- | --- |
| Last activity | ${localTime} |
| Current automation streak | ${stats.streakDays} day(s) |
| Total generated updates | ${stats.totalCommits} |
| Last report date | ${report.date} |
| Latest topics | ${report.topics.join(", ")} |
${END}`;

    const current = await this.readCurrentReadme();
    const next = current.includes(START) && current.includes(END)
      ? current.replace(new RegExp(`${START}[\\s\\S]*?${END}`), section)
      : `${current.trim()}\n\n## Automation Status\n\n${section}\n`;

    await writeText(README_PATH, `${next.trim()}\n`);
  }

  async readCurrentReadme() {
    if (!(await fileExists(README_PATH))) {
      return "# GitHub Streak Bot\n\nA scheduled repository maintenance automation project.";
    }
    return readFile(README_PATH, "utf8");
  }
}
