import { logger } from '../../../packages/core/src/index.js';
import { DuolingoScraper } from './tasks/DuolingoScraper.js';
import fs from 'fs';
import path from 'path';
import { telegram, caller } from '../../../packages/core/src/index.js';

const scrapers: Record<string, any> = {
  duolingo: new DuolingoScraper(),
};

async function main() {
  const args = process.argv.slice(2);
  const scraperName = args[0];
  
  // Try to load config
  // Use process.cwd() because compiled path is deep in dist
  // CWD is services/scraper
  const configPath = path.resolve(process.cwd(), '../../config/users.json');
  let usersConfig: any = {};
  
  try {
    if (fs.existsSync(configPath)) {
      usersConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
      logger.warn(`Config file not found at ${configPath}`);
    }
  } catch (e) {
    logger.error("Failed to parse config", e);
  }

  if (!scraperName || !scrapers[scraperName]) {
    logger.error(`Scraper not found: ${scraperName}. Available: ${Object.keys(scrapers).join(', ')}`);
    process.exit(1);
  }

  logger.info(`Running scraper ${scraperName}...`);

  // Get users for this specific scraper
  const targets = usersConfig[scraperName] || [];
  
  // Allow CLI override if params provided
  if (args[1]) {
    targets.push({ username: args[1], lastStreak: 0 }); // Default 0 if manual override
  }

  if (targets.length === 0) {
    logger.warn(`No targets found for ${scraperName} in config or CLI args.`);
    return;
  }

  logger.info(`Targets found: ${targets.map((t: any) => t.username).join(', ')}`);

  const results: any[] = [];

  for (const target of targets) {
    const result = await scrapers[scraperName].run(target);

    if (result.success && result.data) {
      results.push(result.data);
    } else {
      console.error(`❌ Scrape Failed for ${target.username}:`, result.error);
    }
  }

  // Print all results as a single JSON block
  console.log(JSON.stringify(results, null, 2));

  // Notification Logic
  console.log('\n--- Notification Check ---');

  for (const result of results) {
    if (result.completedToday === false) {
      const userConfig = targets.find((t: any) => t.username === result.username);
      console.log('DEBUG: userConfig', JSON.stringify(userConfig));
      const rawTgUser = userConfig?.telegramUsername || result.username;
      // Escape underscores for Markdown
      const tgUser = rawTgUser.replace(/_/g, '\\_');

      // Message Format: "@pepsi_tg 🚨 Duolingo incomplete! Streak: 773"
      const message = `${tgUser} 🚨 *Duolingo Incomplete!* \nStreak: ${result.streak}`;
      
      console.log(`Sending alert for ${tgUser}...`);
      await telegram.sendMessage(message);

      // Call Logic
      if (userConfig?.makeCall && userConfig?.phoneNumber) {
        // Use configured number or generic message
        const callMessage = `Alert. Duolingo streak for ${result.username} is incomplete. Streak is ${result.streak}.`;
        console.log(`Initiating call for ${userConfig.phoneNumber}...`);
        await caller.makeCall(userConfig.phoneNumber, callMessage);
      }
    }
  }
}

main().catch(err => logger.error("Fatal error", err));
