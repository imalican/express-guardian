import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate';
import { authenticate, requireRoles } from '../../shared/middlewares/auth';
import { userService } from './service';
import { updateUserSchema, listUsersSchema } from './validation';
import { asyncHandler } from '../../shared/utils/async-handler';

export const userRoutes = Router();

// Get all users (admin only)
userRoutes.get(
  '/',
  authenticate,
  requireRoles(['admin']),
  validate(listUsersSchema),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await userService.listUsers(page, limit);
    res.json(result);
  })
);

// Get user by ID
userRoutes.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json({ user });
  })
);

// Update user
userRoutes.patch(
  '/:id',
  authenticate,
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ user });
  })
);

// Delete user (admin only)
userRoutes.delete(
  '/:id',
  authenticate,
  requireRoles(['admin']),
  asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  })
);
