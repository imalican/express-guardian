import type { Request } from 'express';
import { logger } from '../utils/logger';

const SLOW_API_THRESHOLD = 1000; // 1 second

export const performanceInterceptor = {
  before: (req: Request) => {
    req.startTime = Date.now();
  },

  after: (req: Request) => {
    const duration = Date.now() - (req.startTime || 0);
    if (duration > SLOW_API_THRESHOLD) {
      logger.warn({
        type: 'slow-api',
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }
  },
};
