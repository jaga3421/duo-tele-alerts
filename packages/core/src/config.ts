import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from './logger.js';

import path from 'path';

// Load .env from root of monorepo (CWD is services/scraper)
const envPath = path.resolve(process.cwd(), '../../.env');
// console.log('Loading .env from:', envPath); // Debug
dotenv.config({ path: envPath });

const ConfigSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export const config = (() => {
  try {
    return ConfigSchema.parse(process.env);
  } catch (error) {
    logger.error('Invalid configuration', error);
    return {};
  }
})();
