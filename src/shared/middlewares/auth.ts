import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt';
import { AuthenticationError } from '../utils/errors';
import { JWTPayload } from '../../features/auth/types';

export interface RequestWithUser extends Request {
  user?: JWTPayload;
}

export const authenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const payload = await jwtService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthenticationError('Insufficient permissions'));
    }

    next();
  };
};

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return req.cookies?.accessToken;
}
