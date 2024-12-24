import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export const loggingInterceptor = {
  before: (req: Request) => {
    req.startTime = Date.now();
    logger.info({
      type: 'request',
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body,
      headers: {
        userAgent: req.get('user-agent'),
        contentType: req.get('content-type'),
      },
    });
  },

  after: (req: Request, res: Response) => {
    const duration = Date.now() - (req.startTime || 0);
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  },

  error: (error: Error, req: Request) => {
    logger.error({
      type: 'error',
      method: req.method,
      url: req.url,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  },
};
