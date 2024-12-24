import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { authenticate, requireRoles } from '../middlewares/auth';

export const logsRoutes = Router();

logsRoutes.get('/', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const logFile = await fs.readFile(
      path.join(process.cwd(), 'logs', 'app.log'),
      'utf-8'
    );
    const logs = logFile
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});
