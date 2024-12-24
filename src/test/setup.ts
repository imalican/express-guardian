import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock Redis
jest.mock('../shared/services/redis', () => ({
  redisService: {
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));
