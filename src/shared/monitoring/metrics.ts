import { Application, Request, Response, NextFunction, Router } from 'express';
import { redisService } from '../services/redis';
import { logger } from '../utils/logger';
import { authenticate, requireRoles } from '../middlewares/auth';

interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
}

interface SystemMetrics {
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  uptime: number;
  timestamp: number;
}

interface APIMetrics {
  hits: number;
  totalDuration: number;
  avgDuration: number;
  errors: number;
  lastAccessed: number;
}

class MetricsCollector {
  private readonly metricsPrefix = 'metrics:';
  private readonly retentionPeriod = 24 * 60 * 60; // 24 hours

  async recordRequest(metrics: RequestMetrics): Promise<void> {
    const key = `${this.metricsPrefix}request:${Date.now()}`;
    await redisService.set(key, metrics, this.retentionPeriod);
  }

  async recordSystemMetrics(): Promise<void> {
    const metrics: SystemMetrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      timestamp: Date.now(),
    };

    const key = `${this.metricsPrefix}system:${Date.now()}`;
    await redisService.set(key, metrics, this.retentionPeriod);
  }

  async getRequestMetrics(
    _startTime: number,
    _endTime: number
  ): Promise<RequestMetrics[]> {
    return [];
  }

  async getSystemMetrics(
    _startTime: number,
    _endTime: number
  ): Promise<SystemMetrics[]> {
    return [];
  }
}

const metricsCollector = new MetricsCollector();

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const metrics: RequestMetrics = {
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime: Date.now() - startTime,
      timestamp: Date.now(),
    };

    metricsCollector.recordRequest(metrics).catch((error) => {
      logger.error('Failed to record request metrics:', error);
    });
  });

  next();
}

export function setupMetrics(app: Application): void {
  // Add metrics middleware
  app.use(metricsMiddleware);

  // Start system metrics collection
  setInterval(() => {
    metricsCollector
      .recordSystemMetrics()
      .catch((error) =>
        logger.error('Failed to record system metrics:', error)
      );
  }, 60000); // Every minute

  // Metrics endpoint
  app.get('/metrics', async (req, res) => {
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000; // Last 24 hours

    try {
      const [requestMetrics, systemMetrics] = await Promise.all([
        metricsCollector.getRequestMetrics(startTime, endTime),
        metricsCollector.getSystemMetrics(startTime, endTime),
      ]);

      res.json({
        request: requestMetrics,
        system: systemMetrics,
      });
    } catch (error) {
      logger.error('Failed to retrieve metrics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve metrics',
      });
    }
  });
}

export const metricsRoutes = Router();

metricsRoutes.get(
  '/',
  authenticate,
  requireRoles(['admin']),
  async (req, res) => {
    try {
      const keys = await redisService.client.keys('metrics:*');
      const metrics = await Promise.all(
        keys.map(async (key) => {
          const value = await redisService.get<APIMetrics>(key);
          return {
            endpoint: key.replace('metrics:', ''),
            hits: value?.hits || 0,
            totalDuration: value?.totalDuration || 0,
            avgDuration: value?.avgDuration || 0,
            errors: value?.errors || 0,
            lastAccessed: value?.lastAccessed || Date.now(),
          };
        })
      );

      res.json({
        metrics,
        total: metrics.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve metrics' });
    }
  }
);
