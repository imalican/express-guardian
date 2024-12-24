import express from 'express';
import { setupMiddlewares } from './shared/middlewares';
import { setupRoutes } from './shared/routes';
import { logger } from './shared/utils/logger';
import { config } from './shared/config';
import { connectDatabase } from './shared/config/database';
import { setupMonitoring } from './shared/monitoring';
import { setupSwagger } from './shared/docs/swagger';
import { redisService } from './shared/services/redis';

const app = express();

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await redisService.connect();

    // Setup middlewares
    await setupMiddlewares(app);

    // Setup Swagger documentation (before routes)
    setupSwagger(app);

    // Setup routes
    setupRoutes(app);

    // Setup monitoring
    setupMonitoring(app);

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(
        `API Documentation available at http://localhost:${config.port}/api-docs`
      );
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
