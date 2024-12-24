declare namespace Express {
  interface Request {
    startTime?: number;
    context?: {
      requestId: string;
      correlationId: string;
      userId?: string;
      role?: string;
    };
  }
}
