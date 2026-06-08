# GitHub Streak Bot

A production-ready GitHub automation bot for legitimate scheduled repository maintenance. It generates daily developer notes, activity reports, statistics, changelog entries, logs, and README status updates, then commits and pushes those updates with GitHub Actions.

This project is designed for transparent automation. It should be used to maintain real project journals, generated reports, documentation health, learning logs, or repository operations history. Avoid using it to misrepresent manual development work.

## Features

- Daily GitHub Actions schedule with manual trigger support
- Meaningful generated file updates instead of empty placeholder commits
- Dynamic commit messages with natural rotation
- Markdown notes, JSON reports, streak stats, changelog entries, and activity logs
- README status section auto-updater
- Optional OpenAI or Gemini content generation
- Optional multi-repository publishing through the GitHub REST API
- Optional Discord and Telegram notifications
- Retry handling for remote publishing and workflow pushes
- Secure configuration with GitHub Secrets and environment variables
- Dry-run support for manual testing

## Architecture

```text
github-streak-bot/
+-- .github/workflows/
|   +-- daily-streak.yml
|   +-- manual-trigger.yml
+-- src/
|   +-- ai/
|   +-- config/
|   +-- generators/
|   +-- github/
|   +-- services/
|   +-- utils/
|   +-- main.js
+-- generated/
|   +-- markdown/
|   +-- reports/
|   +-- stats/
|   +-- logs/
+-- logs/
+-- scripts/
+-- templates/
+-- .env.example
+-- CHANGELOG.md
+-- LICENSE
+-- package.json
+-- README.md
```

## How It Works

1. GitHub Actions starts the daily workflow from `.github/workflows/daily-streak.yml`.
2. Node.js installs dependencies and runs `npm start`.
3. The bot generates or refreshes:
   - `generated/markdown/daily-note.md`
   - `generated/reports/report.json`
   - `generated/stats/streak-stats.json`
   - `generated/logs/activity-log.txt`
   - `CHANGELOG.md`
   - `README.md`
4. The workflow commits the generated changes if there are any.
5. The workflow pushes the commit with retry handling.
6. Optional secondary repositories are updated through the GitHub REST API.

## Automation Status

<!-- GITHUB_STREAK_BOT:START -->
| Metric | Value |
| --- | --- |
| Last activity | Monday, June 8, 2026 at 5:06:50 PM |
| Current automation streak | 4 day(s) |
| Total generated updates | 20 |
| Last report date | 2026-06-08 |
| Latest topics | automation reliability, performance review, refactoring |
<!-- GITHUB_STREAK_BOT:END -->

## Installation

```bash
npm install
cp .env.example .env
npm run validate
npm start
```

For GitHub Actions, commit this project to a GitHub repository. The workflows will run after they are present on the default branch.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `BOT_TIMEZONE` | No | Timezone used for daily dates and readable logs. |
| `DRY_RUN` | No | Skips secondary repository publishing when `true`. |
| `RANDOM_DELAY_MINUTES` | No | Adds a random Actions delay to avoid rigid execution timing. |
| `GIT_AUTHOR_NAME` | No | Git author name for workflow commits. |
| `GIT_AUTHOR_EMAIL` | No | Git author email for workflow commits. |
| `GITHUB_TOKEN` | For remote targets | GitHub token used by REST publishing. |
| `GITHUB_OWNER` | For issue creation | Owner for failure issue creation. |
| `GITHUB_REPOSITORY` | For issue creation | Repository for failure issue creation. |
| `GITHUB_BRANCH` | No | Branch for generated updates. |
| `TARGET_REPOSITORIES` | No | JSON array of secondary repositories to update. |
| `AI_PROVIDER` | No | `none`, `openai`, or `gemini`. |
| `OPENAI_API_KEY` | If OpenAI enabled | OpenAI API key stored as a secret. |
| `GEMINI_API_KEY` | If Gemini enabled | Gemini API key stored as a secret. |
| `DISCORD_WEBHOOK_URL` | No | Sends success and failure notifications. |
| `TELEGRAM_BOT_TOKEN` | No | Telegram notification bot token. |
| `TELEGRAM_CHAT_ID` | No | Telegram chat ID for notifications. |

## GitHub Actions Setup

Add these repository variables if you want custom behavior:

- `BOT_TIMEZONE`: for example `Asia/Calcutta`
- `AI_PROVIDER`: `none`, `openai`, or `gemini`
- `OPENAI_MODEL`: for example `gpt-4o-mini`
- `GEMINI_MODEL`: for example `gemini-1.5-flash`
- `CREATE_ISSUE_ON_FAILURE`: `true` or `false`

Add these repository secrets only when needed:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `TARGET_REPOSITORIES`
- `DISCORD_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

The built-in `secrets.GITHUB_TOKEN` is enough for committing back to the current repository. If you publish to repositories outside the current one, use a fine-scoped personal access token or GitHub App token with `contents:write` permission.

## Multi-Repository Configuration

Set `TARGET_REPOSITORIES` as a GitHub Actions secret containing JSON:

```json
[
  {
    "owner": "your-org",
    "repo": "developer-journal",
    "branch": "main",
    "pathPrefix": "automation"
  },
  {
    "owner": "your-user",
    "repo": "profile-notes",
    "branch": "main",
    "pathPrefix": "generated"
  }
]
```

The bot publishes generated artifacts to each target with REST API upserts. This avoids cloning many repositories inside the workflow.

## AI Content Generation

AI is optional. Without API keys, the bot uses a deterministic fallback generator that writes transparent maintenance notes.

To enable OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-secret
OPENAI_MODEL=gpt-4o-mini
```

To enable Gemini:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-secret
GEMINI_MODEL=gemini-1.5-flash
```

## Cron Schedule

The default daily workflow runs at `03:17 UTC`:

```yaml
schedule:
  - cron: "17 3 * * *"
```

GitHub cron schedules use UTC. Adjust the cron expression in `.github/workflows/daily-streak.yml` to match your preferred daily window.

## Security Notes

- Never commit `.env` files or API keys.
- Store tokens in GitHub Secrets, not repository variables.
- Use the built-in `GITHUB_TOKEN` whenever possible.
- For cross-repository publishing, prefer a least-privilege fine-scoped token.
- Keep generated activity transparent and useful.
- Review Actions permissions before enabling issue creation or secondary repository publishing.

## Commands

```bash
npm start          # Run the bot locally
npm run dry-run    # Run without secondary repository publishing
npm run validate   # Validate environment configuration
npm run lint       # Syntax check the main entrypoint
```

## Generated Files

| File | Purpose |
| --- | --- |
| `generated/markdown/daily-note.md` | Human-readable daily development note. |
| `generated/reports/report.json` | Machine-readable run report. |
| `generated/stats/streak-stats.json` | Commit, streak, and workflow counters. |
| `generated/logs/activity-log.txt` | Readable activity history. |
| `logs/execution.log` | Structured JSONL runtime log. |
| `logs/latest-run.json` | Latest run summary. |
| `CHANGELOG.md` | Daily maintenance changelog. |
| `README.md` | Auto-updated project status section. |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm ci` fails in Actions | Commit `package-lock.json` after running `npm install`. |
| No commit is created | Check the workflow log. Empty diffs are skipped intentionally. |
| Secondary repo publish fails | Confirm token scope, target owner/repo names, and branch names. |
| AI generation fails | Check provider variables and API key secrets. The fallback generator works without AI. |
| Workflow cannot push | Ensure workflow permissions include `contents: write`. |

## Future Improvements

- GitHub profile README metrics publishing
- Weekly summary rollups
- SVG or PNG activity graphs
- More provider-specific AI prompt templates
- Pull request creation mode for protected branches
- Email notification provider
- Repository-specific generation rules

## Responsible Use

This bot is best used for authentic automated maintenance: documentation refreshes, generated reports, learning journals, status dashboards, and project hygiene. Do not use it to create misleading activity or to spam repositories.
