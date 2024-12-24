import { Response } from 'express';
import { config } from '../../shared/config';

export function setTokenCookie(res: Response, token: string): void {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
  });
}

export function clearTokenCookie(res: Response): void {
  res.clearCookie('accessToken');
}
