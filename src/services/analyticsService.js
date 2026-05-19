import { readJson, writeJson } from "../utils/fs.js";
import { diffDays } from "../utils/date.js";

const STATS_PATH = "generated/stats/streak-stats.json";

export class AnalyticsService {
  async loadStats() {
    return readJson(STATS_PATH, {
      totalCommits: 0,
      streakDays: 0,
      runCount: 0,
      lastPushDate: null,
      generatedFiles: [],
      workflowHistory: []
    });
  }

  async updateStats(date, files, runId) {
    const stats = await this.loadStats();
    const gap = diffDays(stats.lastPushDate, `${date}T00:00:00Z`);
    const streakDays = !stats.lastPushDate ? 1 : gap <= 1 ? stats.streakDays + 1 : 1;

    const nextStats = {
      ...stats,
      totalCommits: stats.totalCommits + 1,
      streakDays,
      runCount: stats.runCount + 1,
      lastPushDate: date,
      generatedFiles: files,
      workflowHistory: [
        {
          runId,
          date,
          filesUpdated: files.length,
          status: "success"
        },
        ...stats.workflowHistory
      ].slice(0, 30)
    };

    await writeJson(STATS_PATH, nextStats);
    return nextStats;
  }
}
