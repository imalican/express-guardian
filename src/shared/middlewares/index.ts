import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { errorHandler } from './error-handler';
import { requestLogger } from './request-logger';
import { createRateLimiter, RateLimitConfig } from './rate-limiter';
import { setupSecurity } from './security';
import { config } from '../config';
import { createInterceptor } from '../interceptors';
import { loggingInterceptor } from '../interceptors/logging.interceptor';
import { performanceInterceptor } from '../interceptors/performance.interceptor';
import { metricsInterceptor } from '../interceptors/metrics.interceptor';
import { trackingMiddleware } from './tracking';

export async function setupMiddlewares(app: Application): Promise<void> {
  // Tracking middleware (should be first)
  app.use(trackingMiddleware);

  // Basic middleware (should be first)
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  app.use(compression());

  // Security middleware
  setupSecurity(app);

  // CORS
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    })
  );

  // Rate limiting
  const globalLimiter = await createRateLimiter(
    RateLimitConfig.GLOBAL.windowMs,
    RateLimitConfig.GLOBAL.max
  );
  app.use(globalLimiter);

  // Logging
  app.use(requestLogger);

  // Error handling (should be last)
  app.use(errorHandler);

  // Interceptors
  app.use(createInterceptor(loggingInterceptor));
  app.use(createInterceptor(performanceInterceptor));
  app.use(createInterceptor(metricsInterceptor));
}
