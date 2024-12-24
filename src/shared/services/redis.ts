import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

export class RedisService {
  public client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: config.redisUrl,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('error', (error) => {
      logger.error('Redis Client Error:', error);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Successfully connected to Redis');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async flushAll(): Promise<void> {
    await this.client.flushAll();
  }
}

export const redisService = new RedisService();
