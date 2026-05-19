import { validateConfig, config } from "../src/config/env.js";

validateConfig();
console.log("Configuration is valid.");
console.log(JSON.stringify({
  timezone: config.timezone,
  aiProvider: config.ai.provider,
  targetRepositories: config.github.targets.length,
  dryRun: config.dryRun
}, null, 2));
