import type { Request } from 'express';
import { redisService } from '../services/redis';

interface APIMetrics {
  hits: number;
  totalDuration: number;
  avgDuration: number;
  errors: number;
  lastAccessed: number;
}

export const metricsInterceptor = {
  before: async (req: Request) => {
    req.startTime = Date.now();
    const key = `metrics:${req.method}:${req.path}`;
    await incrementMetric(key, 'hits');
  },

  after: async (req: Request) => {
    const duration = Date.now() - (req.startTime || 0);
    const key = `metrics:${req.method}:${req.path}`;
    await updateMetrics(key, duration);
  },

  error: async (error: Error, req: Request) => {
    const key = `metrics:${req.method}:${req.path}`;
    await incrementMetric(key, 'errors');
  },
};

async function incrementMetric(
  key: string,
  field: keyof APIMetrics
): Promise<void> {
  const metrics = await getMetrics(key);
  metrics[field]++;
  await saveMetrics(key, metrics);
}

async function updateMetrics(key: string, duration: number): Promise<void> {
  const metrics = await getMetrics(key);
  metrics.totalDuration += duration;
  metrics.avgDuration = metrics.totalDuration / metrics.hits;
  metrics.lastAccessed = Date.now();
  await saveMetrics(key, metrics);
}

async function getMetrics(key: string): Promise<APIMetrics> {
  const metrics = await redisService.get<APIMetrics>(key);
  return (
    metrics || {
      hits: 0,
      totalDuration: 0,
      avgDuration: 0,
      errors: 0,
      lastAccessed: Date.now(),
    }
  );
}

async function saveMetrics(key: string, metrics: APIMetrics): Promise<void> {
  await redisService.set(key, metrics, 60 * 60 * 24); // 24 hours
}
