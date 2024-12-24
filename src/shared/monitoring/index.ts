import { Application } from 'express';
import { setupHealthCheck } from './health-check';
import { setupMetrics } from './metrics';
import { setupAlerts } from './alerts';
import { logsRoutes } from './logs';

export function setupMonitoring(app: Application): void {
  // Setup health checks
  setupHealthCheck(app);

  // Setup metrics collection
  setupMetrics(app);

  // Setup alerting system
  setupAlerts();

  app.use('/monitoring/logs', logsRoutes);
}
