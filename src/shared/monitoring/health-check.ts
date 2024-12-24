import { Router, Application } from 'express';
import mongoose from 'mongoose';
import { config } from '../config';
import { redisService } from '../services/redis';

export const healthCheckRoutes = Router();

healthCheckRoutes.get('/', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: Date.now(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'OK' : 'ERROR',
      redis: redisService.client.isOpen ? 'OK' : 'ERROR',
      api: 'OK',
    },
    environment: config.nodeEnv,
  };

  try {
    res.json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    res.status(503).json(healthcheck);
  }
});

export function setupHealthCheck(app: Application): void {
  app.use('/health', healthCheckRoutes);
}
