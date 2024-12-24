import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisService } from '../services/redis';

export async function createRateLimiter(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max = 100 // Limit each IP to 100 requests per windowMs
) {
  await redisService.connect(); // Ensure Redis is connected

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisService.client.sendCommand(args),
    }),
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.',
    },
  });
}

// Rate limit configurations
export const RateLimitConfig = {
  GLOBAL: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 5,
  },
  API: {
    windowMs: 60 * 1000,
    max: 30,
  },
};
