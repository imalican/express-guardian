import { Router } from 'express';

export const fileRoutes = Router();

fileRoutes.post('/upload', (req, res) => {
  // TODO: Implement file upload
  res.status(501).json({ message: 'Not implemented' });
});
