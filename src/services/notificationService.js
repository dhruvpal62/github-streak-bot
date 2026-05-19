import axios from "axios";

export class NotificationService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  async sendSuccess(summary) {
    const message = `GitHub automation completed for ${summary.date}. Updated ${summary.files.length} files. Current streak: ${summary.stats.streakDays} day(s).`;
    await this.send(message);
  }

  async sendFailure(error) {
    await this.send(`GitHub automation failed: ${error.message}`);
  }

  async send(message) {
    await Promise.allSettled([
      this.sendDiscord(message),
      this.sendTelegram(message)
    ]);
  }

  async sendDiscord(message) {
    if (!this.config.discordWebhookUrl) return;
    await axios.post(this.config.discordWebhookUrl, { content: message });
    await this.logger.info("Sent Discord notification.");
  }

  async sendTelegram(message) {
    if (!this.config.telegramBotToken || !this.config.telegramChatId) return;
    const url = `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`;
    await axios.post(url, {
      chat_id: this.config.telegramChatId,
      text: message
    });
    await this.logger.info("Sent Telegram notification.");
  }
}
