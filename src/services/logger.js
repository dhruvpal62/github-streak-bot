import { appendText, writeText } from "../utils/fs.js";
import { toHumanDateTime, toIsoDate } from "../utils/date.js";

const LOG_DIR = "logs";
const GENERATED_LOG = "generated/logs/activity-log.txt";

export class Logger {
  constructor(timezone = "UTC") {
    this.timezone = timezone;
    this.runId = `${toIsoDate(new Date(), timezone)}-${Date.now()}`;
  }

  async info(message, meta = {}) {
    await this.write("INFO", message, meta);
  }

  async success(message, meta = {}) {
    await this.write("SUCCESS", message, meta);
  }

  async error(message, meta = {}) {
    await this.write("ERROR", message, meta);
  }

  async write(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      localTime: toHumanDateTime(new Date(), this.timezone),
      runId: this.runId,
      level,
      message,
      meta
    };
    const line = `${JSON.stringify(entry)}\n`;
    await appendText(`${LOG_DIR}/execution.log`, line);
    await appendText(GENERATED_LOG, `[${entry.localTime}] ${level}: ${message}\n`);
  }

  async writeRunSummary(summary) {
    await writeText(`${LOG_DIR}/latest-run.json`, `${JSON.stringify(summary, null, 2)}\n`);
  }
}
