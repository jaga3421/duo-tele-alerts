import { logger } from './logger.js';
import { config } from './config.js';

export class TelegramService {
  private botToken: string;
  private chatId: string;

  constructor() {
    this.botToken = config.TELEGRAM_BOT_TOKEN || '';
    this.chatId = config.TELEGRAM_CHAT_ID || '';

    if (!this.botToken || !this.chatId) {
      logger.warn('Telegram credentials missing (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID). Notifications will be skipped.');
    }
  }

  async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      logger.warn('Skipping Telegram message: Credentials missing.');
      return false;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown' // Allows bolding/mentions
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        logger.error(`Telegram API connection failed: ${response.status} ${response.statusText}`, { response: errText });
        return false;
      }

      const result = await response.json() as { ok?: boolean; [key: string]: unknown };
      if (!result.ok) {
        logger.error('Telegram API error:', result);
        return false;
      }

      logger.info('Telegram message sent successfully.');
      return true;

    } catch (error) {
      logger.error('Error sending Telegram message:', error);
      return false;
    }
  }
  async makeCall(username: string, message: string): Promise<boolean> {
    if (!username) {
      logger.warn('Skipping CallMeBot call: Username missing.');
      return false;
    }

    // CallMeBot API: http://api.callmebot.com/start.php?user=@user&text=msg&lang=en-US-Standard-C
    const encodedMessage = encodeURIComponent(message);
    const url = `http://api.callmebot.com/start.php?user=${username}&text=${encodedMessage}&lang=en-US-Standard-C`;

    try {
      logger.info(`Initiating CallMeBot call to ${username}...`);
      const response = await fetch(url);

      if (!response.ok) {
        logger.error(`CallMeBot API failed: ${response.status} ${response.statusText}`);
        return false;
      }

      logger.info('CallMeBot request sent successfully.');
      return true;
    } catch (error) {
      logger.error('Error initiating CallMeBot call:', error);
      return false;
    }
  }
}

export const telegram = new TelegramService();
