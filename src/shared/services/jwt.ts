import jwt from 'jsonwebtoken';
import { config } from '../config';
import { redisService } from './redis';
import { logger } from '../utils/logger';
import { JWTPayload } from '../../features/auth/types';

export class JWTService {
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';
  private readonly blacklistPrefix = 'token:blacklist:';

  async generateTokens(payload: Omit<JWTPayload, 'exp' | 'iat'>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: this.refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    await this.checkBlacklist(token);
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  }

  async verifyRefreshToken(token: string): Promise<JWTPayload> {
    await this.checkBlacklist(token);
    return jwt.verify(token, config.jwtRefreshSecret) as JWTPayload;
  }

  async blacklistToken(token: string): Promise<void> {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return;

    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return;

    const key = `${this.blacklistPrefix}${token}`;
    await redisService.set(key, true, ttl);
    logger.info(`Token blacklisted: ${key}`);
  }

  private async checkBlacklist(token: string): Promise<void> {
    const key = `${this.blacklistPrefix}${token}`;
    const isBlacklisted = await redisService.get(key);
    if (isBlacklisted) {
      throw new Error('Token is blacklisted');
    }
  }
}

export const jwtService = new JWTService();
