import { Application } from 'express';
import helmet from 'helmet';

export function setupSecurity(app: Application): void {
  app.use(helmet());

  // TODO: Configure CSRF properly
  // app.use(csrf({...}));
}
