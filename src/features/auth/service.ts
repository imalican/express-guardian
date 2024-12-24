import jwt from 'jsonwebtoken';
import { LoginCredentials, AuthTokens, JWTPayload } from './types';
import { config } from '../../shared/config';
import { logger } from '../../shared/utils/logger';
import { UserModel } from '../users/model';
import { AuthenticationError } from '../../shared/utils/errors';
import { CreateUserDTO } from '../users/types';
import { User } from '../users/model';
import { userService } from '../users/service';

export class AuthService {
  private readonly TOKEN_CONFIG = {
    access: {
      secret: config.jwtSecret,
      expiry: '15m',
    },
    refresh: {
      secret: config.jwtRefreshSecret,
      expiry: '7d',
    },
  } as const;

  private createToken(
    payload: Omit<JWTPayload, 'exp' | 'iat'>,
    type: 'access' | 'refresh'
  ): string {
    return jwt.sign(payload, this.TOKEN_CONFIG[type].secret, {
      expiresIn: this.TOKEN_CONFIG[type].expiry,
    });
  }

  private async verifyToken(
    token: string,
    type: 'access' | 'refresh'
  ): Promise<JWTPayload> {
    try {
      return jwt.verify(token, this.TOKEN_CONFIG[type].secret) as JWTPayload;
    } catch (error) {
      throw new AuthenticationError(
        `Invalid ${type} token: ${(error as Error).message}`
      );
    }
  }

  async generateTokens(
    payload: Omit<JWTPayload, 'exp' | 'iat'>
  ): Promise<AuthTokens> {
    return {
      accessToken: this.createToken(payload, 'access'),
      refreshToken: this.createToken(payload, 'refresh'),
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    logger.info('Login attempt for user:', credentials.email);

    const user = await UserModel.findOne({ email: credentials.email }).select(
      '+password'
    );
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    return this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    const decoded = await this.verifyToken(token, 'refresh');
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async register(userData: CreateUserDTO): Promise<User> {
    logger.info('Registering new user:', userData.email);
    return userService.createUser(userData);
  }

  async logout(userId: string): Promise<void> {
    logger.info('Logout for user:', userId);
  }
}

export const authService = new AuthService();
