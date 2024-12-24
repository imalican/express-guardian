import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface Interceptor {
  before?: (req: Request) => Promise<void> | void;
  after?: (req: Request, res: Response) => Promise<void> | void;
  error?: (error: Error, req: Request, res: Response) => Promise<void> | void;
}

export const createInterceptor = (interceptor: Interceptor) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Before request
      if (interceptor.before) {
        await interceptor.before(req);
      }

      // Store original send
      const originalSend = res.send;

      // Override send
      res.send = function (body) {
        res.send = originalSend;
        if (interceptor.after) {
          const afterResult = interceptor.after(req, res);
          if (afterResult instanceof Promise) {
            afterResult.catch(logger.error);
          }
        }
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      if (interceptor.error) {
        await interceptor.error(error as Error, req, res);
      }
      next(error);
    }
  };
};
