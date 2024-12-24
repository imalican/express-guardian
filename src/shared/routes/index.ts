import { Application } from 'express';
import { authRoutes } from '../../features/auth/routes';
import { userRoutes } from '../../features/users/routes';
import { fileRoutes } from '../../features/files/routes';
import { healthCheckRoutes } from '../monitoring/health-check';
import { logsRoutes } from '../monitoring/logs';
import { metricsRoutes } from '../monitoring/metrics';
import { NotFoundError } from '../utils/errors';

export function setupRoutes(app: Application): void {
  // Root route
  app.get('/', (req, res) => {
    res.json({
      message: 'Express Guardian API',
      version: '1.0.0',
      docs: '/api-docs',
    });
  });

  // Monitoring Routes (should be before API routes)
  app.use('/health', healthCheckRoutes);
  app.use('/monitoring/logs', logsRoutes);
  app.use('/metrics', metricsRoutes);

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/files', fileRoutes);

  // 404 Handler (should be last)
  app.use((req, res, next) => {
    next(new NotFoundError('Route'));
  });
}
