import { logger } from '../../../../packages/core/src/index.js';

export interface ScraperResult {
  success: boolean;
  data?: any;
  error?: string;
}

export abstract class BaseScraper {
  abstract name: string;

  async run(params?: any): Promise<ScraperResult> {
    logger.info(`Starting scraper: ${this.name}`);
    try {
      const result = await this.scrape(params);
      logger.info(`Finished scraper: ${this.name}`, { 
        success: result.success,
        data: result.data // Actually print the data!
      });
      return result;
    } catch (error: any) {
      logger.error(`Error in scraper: ${this.name}`, error);
      return { success: false, error: error.message };
    }
  }

  protected abstract scrape(params?: any): Promise<ScraperResult>;
}
