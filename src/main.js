import { config, validateConfig } from "./config/env.js";
import { randomInt, sleep } from "./utils/random.js";
import { Logger } from "./services/logger.js";
import { AiService } from "./ai/aiService.js";
import { ContentGenerator } from "./generators/contentGenerator.js";
import { AnalyticsService } from "./services/analyticsService.js";
import { ReadmeUpdater } from "./services/readmeUpdater.js";
import { ChangelogService } from "./services/changelogService.js";
import { ActivityService } from "./services/activityService.js";
import { GitHubApiService } from "./github/githubApiService.js";
import { MultiRepositoryPublisher } from "./github/multiRepositoryPublisher.js";
import { NotificationService } from "./services/notificationService.js";

const logger = new Logger(config.timezone);

const main = async () => {

  console.log("BOT STARTED");

  validateConfig();

  console.log("CONFIG LOADED");

  if (config.randomDelayMinutes > 0 && process.env.GITHUB_ACTIONS === "true") {
    const delay = randomInt(0, config.randomDelayMinutes);
    console.log(`Applying delay: ${delay} minutes`);
    await logger.info("Applying randomized workflow delay.", { delayMinutes: delay });
    await sleep(delay * 60_000);
  }

  await logger.info("Starting scheduled repository maintenance.", {
    timezone: config.timezone,
    dryRun: config.dryRun
  });

  console.log("INITIALIZING SERVICES");

  const aiService = new AiService(config.ai, logger);
  const activityService = new ActivityService({
    analyticsService: new AnalyticsService(),
    contentGenerator: new ContentGenerator(aiService, config.timezone),
    readmeUpdater: new ReadmeUpdater(),
    changelogService: new ChangelogService(),
    logger,
    timezone: config.timezone
  });

  console.log("RUNNING ACTIVITY SERVICE...");

  const summary = await activityService.run();
  console.log("ACTIVITY SERVICE FINISHED");
  console.log(summary);

  const publisher = new MultiRepositoryPublisher(
    new GitHubApiService(config.github, logger),
    config.github.targets,
    logger,
    config.dryRun
  );

  console.log("PUBLISHING STARTED");

  try {
    await publisher.publish(
      summary.files.filter((file) => file !== "README.md")
    );

    console.log("PUBLISH COMPLETE");
  } catch (err) {
    console.error("PUBLISH FAILED");
    console.error(err);
  }

  const notificationService = new NotificationService(config.notifications, logger);
  await notificationService.sendSuccess(summary);
  await logger.writeRunSummary(summary);
  await logger.success("Scheduled repository maintenance finished.", summary);
};
console.log("BOT FINISHED SUCCESSFULLY");


main().catch(async (error) => {
  await logger.error("Scheduled repository maintenance failed.", {
    message: error.message,
    stack: error.stack
  });

  console.log("BOT FINISHED SUCCESSFULLY");


  const notificationService = new NotificationService(config.notifications, logger);
  await notificationService.sendFailure(error);

  if (config.failures.createIssue && config.github.token && config.github.owner && config.github.repository) {
    const github = new GitHubApiService(config.github, logger);
    await github.createIssue({
      owner: config.github.owner,
      repo: config.github.repository,
      title: "Automation failure detected",
      body: `The scheduled automation failed.\n\n\`\`\`\n${error.stack || error.message}\n\`\`\``,
      labels: config.failures.labels
    });
  }

  process.exitCode = 1;
});
