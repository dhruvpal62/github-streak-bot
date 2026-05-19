import { readFile } from "node:fs/promises";
import { fileExists } from "../utils/fs.js";

export class MultiRepositoryPublisher {
  constructor(githubApiService, targets, logger, dryRun = false) {
    this.githubApiService = githubApiService;
    this.targets = targets;
    this.logger = logger;
    this.dryRun = dryRun;
  }

  async publish(paths) {
    if (!this.targets.length) {
      await this.logger.info("No secondary repositories configured.");
      return;
    }

    const files = [];
    for (const filePath of paths) {
      if (await fileExists(filePath)) {
        files.push({ path: filePath, content: await readFile(filePath, "utf8") });
      }
    }

    if (this.dryRun) {
      await this.logger.info("Dry run enabled; skipped secondary repository publishing.", {
        targets: this.targets.length,
        files: files.length
      });
      return;
    }

    for (const target of this.targets) {
      await this.githubApiService.publishFiles(target, files);
    }
  }
}
