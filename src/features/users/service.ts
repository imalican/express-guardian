import { User, CreateUserDTO, UpdateUserDTO } from './types';
import { UserModel } from './model';
import { logger } from '../../shared/utils/logger';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { redisService } from '../../shared/services/redis';
import mongoose from 'mongoose';

export class UserService {
  async createUser(userData: CreateUserDTO): Promise<User> {
    logger.info('Creating new user:', userData.email);

    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const user = await UserModel.create(userData);
    return this.sanitizeUser(user);
  }

  async getUserById(id: string): Promise<User> {
    logger.info('Fetching user by id:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid user ID format');
    }

    const allUsers = await UserModel.find();
    logger.info(
      'All users in DB:',
      allUsers.map((u) => ({ id: u.id, email: u.email }))
    );

    const user = await UserModel.findById(id);
    logger.info('Found user:', user);

    if (!user) {
      throw new NotFoundError('User');
    }

    const sanitizedUser = this.sanitizeUser(user);
    return sanitizedUser;
  }

  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    logger.info('Updating user:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid user ID format');
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (userData.email && userData.email !== user.email) {
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        throw new ValidationError('Email already exists');
      }
    }

    Object.assign(user, userData);
    await user.save();

    const sanitizedUser = this.sanitizeUser(user);

    return sanitizedUser;
  }

  async deleteUser(id: string): Promise<void> {
    logger.info('Deleting user:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid user ID format');
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    await UserModel.findByIdAndDelete(id);
  }

  async listUsers(
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit),
      UserModel.countDocuments(),
    ]);

    logger.info('Found users:', users);

    const result = {
      users: users.map(this.sanitizeUser),
      total,
    };

    return result;
  }

  private sanitizeUser(user: typeof UserModel.prototype): User {
    logger.info('Sanitizing user:', user);
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.__v;
    logger.info('Sanitized user:', sanitizedUser);
    return sanitizedUser as User;
  }

  private getCacheKey(type: string, id: string): string {
    return `user:${type}:${id}`;
  }

  private async cacheUser(user: User): Promise<void> {
    await redisService.set(this.getCacheKey('id', user.id), user, 60 * 60);
  }
}

export const userService = new UserService();
