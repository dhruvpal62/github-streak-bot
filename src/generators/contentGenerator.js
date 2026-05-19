import { CONTENT_TOPICS } from "../config/defaults.js";
import { sample } from "../utils/random.js";

export class ContentGenerator {
  constructor(aiService, timezone) {
    this.aiService = aiService;
    this.timezone = timezone;
  }

  async buildDailyContent(date, stats) {
    const topics = sample(CONTENT_TOPICS, 3);
    const note = await this.aiService.generateDailyNote({ date, topics, stats });

    const report = {
      date,
      timezone: this.timezone,
      topics,
      summary: "Scheduled repository maintenance completed successfully.",
      filesUpdated: [
        "generated/markdown/daily-note.md",
        "generated/reports/report.json",
        "generated/stats/streak-stats.json",
        "generated/logs/activity-log.txt",
        "CHANGELOG.md",
        "README.md"
      ],
      metrics: {
        totalCommits: stats.totalCommits,
        streakDays: stats.streakDays,
        runCount: stats.runCount
      }
    };

    return { note, report, topics };
  }
}
