import { appendText, writeJson, writeText } from "../utils/fs.js";
import { toHumanDateTime, toIsoDate } from "../utils/date.js";

export class ActivityService {
  constructor({ analyticsService, contentGenerator, readmeUpdater, changelogService, logger, timezone }) {
    this.analyticsService = analyticsService;
    this.contentGenerator = contentGenerator;
    this.readmeUpdater = readmeUpdater;
    this.changelogService = changelogService;
    this.logger = logger;
    this.timezone = timezone;
  }

  async run() {
    const date = toIsoDate(new Date(), this.timezone);
    const localTime = toHumanDateTime(new Date(), this.timezone);
    const previousStats = await this.analyticsService.loadStats();
    const { note, report, topics } = await this.contentGenerator.buildDailyContent(date, previousStats);

    const files = [
      "generated/markdown/daily-note.md",
      "generated/reports/report.json",
      "generated/stats/streak-stats.json",
      "generated/logs/activity-log.txt",
      "CHANGELOG.md",
      "README.md"
    ];

    const stats = await this.analyticsService.updateStats(date, files, this.logger.runId);
    const enrichedReport = {
      ...report,
      generatedAt: new Date().toISOString(),
      localTime,
      runId: this.logger.runId,
      stats
    };

    await writeText("generated/markdown/daily-note.md", `${note.trim()}\n`);
    await writeJson("generated/reports/report.json", enrichedReport);
    await appendText("generated/logs/activity-log.txt", `[${localTime}] Generated daily maintenance update for ${date}.\n`);
    await this.changelogService.appendEntry(date, topics, files);
    await this.readmeUpdater.update(stats, enrichedReport, localTime);
    await this.logger.success("Generated repository activity files.", { date, files });

    return { date, localTime, files, report: enrichedReport, stats };
  }
}
