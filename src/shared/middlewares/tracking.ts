import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const trackingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate request ID if not exists
  req.context = {
    requestId: (req.headers['x-request-id'] as string) || uuidv4(),
    correlationId: (req.headers['x-correlation-id'] as string) || uuidv4(),
  };

  // Add tracking headers to response
  res.setHeader('x-request-id', req.context.requestId);
  res.setHeader('x-correlation-id', req.context.correlationId);

  next();
};
