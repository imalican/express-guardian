import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().default(3000),
  mongoUri: z.string(),
  jwtSecret: z.string(),
  jwtRefreshSecret: z.string(),
  redisUrl: z.string().optional(),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
  awsRegion: z.string().optional(),
  awsS3Bucket: z.string().optional(),
  corsOrigins: z
    .string()
    .default('*')
    .transform((val) => val.split(',')),
  csrfEnabled: z.boolean().default(true),
  secureCookies: z.boolean().default(process.env.NODE_ENV === 'production'),
});

export const config = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  redisUrl: process.env.REDIS_URL,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  awsS3Bucket: process.env.AWS_S3_BUCKET,
});
