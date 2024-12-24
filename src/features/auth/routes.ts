import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate';
import { loginSchema, registerSchema, refreshTokenSchema } from './validation';
import { authService } from './service';
import { authenticate, RequestWithUser } from '../../shared/middlewares/auth';
import { setTokenCookie, clearTokenCookie } from './utils';
import { AuthenticationError } from '../../shared/utils/errors';

export const authRoutes = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request
 */
authRoutes.post(
  '/register',
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
authRoutes.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const tokens = await authService.login(req.body);
    setTokenCookie(res, tokens.accessToken);
    res.json({
      message: 'Login successful',
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
authRoutes.post(
  '/refresh',
  validate(refreshTokenSchema),
  async (req, res, next) => {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      setTokenCookie(res, tokens.accessToken);
      res.json({
        message: 'Token refreshed successfully',
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
authRoutes.post(
  '/logout',
  authenticate,
  async (req: RequestWithUser, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not found');
      }
      await authService.logout(req.user.userId);
      clearTokenCookie(res);
      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }
);
