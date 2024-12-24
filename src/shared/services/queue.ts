import Queue from 'bull';
import { config } from '../config';
import { logger } from '../utils/logger';

interface QueueOptions {
  name: string;
}

export class QueueService {
  private queues: Map<string, Queue.Queue> = new Map();

  createQueue<T = unknown>({ name }: QueueOptions): Queue.Queue<T> {
    if (this.queues.has(name)) {
      return this.queues.get(name) as Queue.Queue<T>;
    }

    if (!config.redisUrl) {
      throw new Error('Redis URL is not configured');
    }

    const queue = new Queue(name, config.redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    queue.on('error', (error) => {
      logger.error(`Queue ${name} error:`, error);
    });

    queue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} in queue ${name} failed:`, error);
    });

    this.queues.set(name, queue);
    return queue;
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map((queue) =>
      queue.close()
    );
    await Promise.all(closePromises);
    this.queues.clear();
  }
}

export const queueService = new QueueService();
