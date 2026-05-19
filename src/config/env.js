import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  timezone: process.env.BOT_TIMEZONE ?? "UTC",
  dryRun: parseBoolean(process.env.DRY_RUN, false),
  maxDailyCommits: parseNumber(process.env.MAX_DAILY_COMMITS, 1),
  randomDelayMinutes: parseNumber(process.env.RANDOM_DELAY_MINUTES, 0),
  git: {
    authorName: process.env.GIT_AUTHOR_NAME ?? "github-streak-bot",
    authorEmail: process.env.GIT_AUTHOR_EMAIL ?? "github-streak-bot@users.noreply.github.com"
  },
  github: {
    token: process.env.GITHUB_TOKEN ?? "",
    owner: process.env.GITHUB_OWNER ?? "",
    repository: process.env.GITHUB_REPOSITORY ?? "",
    branch: process.env.GITHUB_BRANCH ?? "main",
    targets: parseJson(process.env.TARGET_REPOSITORIES, [])
  },
  ai: {
    provider: (process.env.AI_PROVIDER ?? "none").toLowerCase(),
    openaiKey: process.env.OPENAI_API_KEY ?? "",
    openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    geminiKey: process.env.GEMINI_API_KEY ?? "",
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash"
  },
  notifications: {
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? "",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID ?? ""
  },
  failures: {
    createIssue: parseBoolean(process.env.CREATE_ISSUE_ON_FAILURE, false),
    labels: (process.env.FAILURE_ISSUE_LABELS ?? "automation,bug")
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean)
  }
};

export const validateConfig = () => {
  if (!Array.isArray(config.github.targets)) {
    throw new Error("TARGET_REPOSITORIES must be a JSON array.");
  }

  for (const [index, target] of config.github.targets.entries()) {
    if (!target.owner || !target.repo) {
      throw new Error(`TARGET_REPOSITORIES[${index}] must include owner and repo.`);
    }
  }

  if (config.github.targets.length > 0 && !config.github.token) {
    throw new Error("GITHUB_TOKEN is required when TARGET_REPOSITORIES is configured.");
  }

  if (config.ai.provider === "openai" && !config.ai.openaiKey) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai.");
  }

  if (config.ai.provider === "gemini" && !config.ai.geminiKey) {
    throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini.");
  }
};
