import { chromium } from 'playwright';
import { BaseScraper, ScraperResult } from '../engine/BaseScraper.js';
import { logger } from '../../../../packages/core/src/index.js';

export class DuolingoScraper extends BaseScraper {
  name = 'duolingo';

  protected async scrape(params?: any): Promise<ScraperResult> {
    const username = params?.username;
    if (!username) {
      throw new Error('Username is required');
    }

    const url = `https://www.duolingo.com/profile/${username}`;
    logger.info(`Navigating to ${url}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Wait for the Name element to appear
      await page.waitForSelector('[data-test="profile-username"]', { timeout: 15000 });

      // Extract Name
      // The HTML shows: <h1 data-test="profile-username">...<span>Apoorva</span>...</h1>
      const name = await page.innerText('[data-test="profile-username"]');

      // Extract Streak
      // The HTML shows the streak number inside a generic div structure.
      // We look for the "Day streak" text and then find the number associated with it.
      // Based on snippet: <h4 class="-TMd4 _1CL8A">773</h4><div class="_3oUUc _1CL8A">Day streak</div>
      // We can find the text "Day streak" and get the sibling/parent.
      
      // Use clearer targeting
      // 1. Find the statistic card that contains "Day streak"
      const streakCard = page.locator('div._2Hzv5', { hasText: 'Day streak' }).first();
      const streakText = await streakCard.locator('h4').innerText();

      // 2. Find the statistic card that contains "Total XP"
      const xpCard = page.locator('div._2Hzv5', { hasText: 'Total XP' }).first();
      const xpText = await xpCard.locator('h4').innerText();

      await browser.close();

      const currentStreak = parseInt(streakText, 10);
      const lastStreak = params.lastStreak || 0;
      
      // Date Logic
      // 1. Calculate days elapsed since the "lastStreakDate"
      // Reference date from config (e.g. "2023-12-21")
      const lastDate = params.lastStreakDate ? new Date(params.lastStreakDate) : new Date();
      // Current date (Today)
      const today = new Date();
      
      // Normalize both to midnight to ignore time parts
      lastDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      // Logic:
      // If daysElapsed = 1 (Last checked yesterday), we expect streak to gain +1.
      // If daysElapsed = 0 (Last checked today), we expect streak to be same (or +1 if we just did it).
        
      // Case 1: Yesterday 773. Today 774. Diff 1. Gap 1. 1==1 -> True.
      // Case 2: Yesterday 773. Today 773. Diff 0. Gap 1. 0!=1 -> False.
      // Case 3: 5 days ago 100. Today 105. Diff 5. Gap 5. 5==5 -> True.
      
      const streakDiff = currentStreak - lastStreak;
      const completedToday = streakDiff >= daysElapsed;

      // Debug log
      logger.info(`Streak Calc: Last ${lastStreak} on ${lastDate.toDateString()}. Today ${today.toDateString()} (Gap ${daysElapsed}). Current ${currentStreak}. Diff ${streakDiff}. Completed? ${completedToday}`);

      return {
        success: true,
        data: {
          username: username,
          displayName: name.split('\n')[0], 
          streak: currentStreak,
          totalXp: xpText,
          completedToday: completedToday
        }
      };

    } catch (error: any) {
      await browser.close();
      throw error;
    }
  }
}
