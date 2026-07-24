import { createClient, type RedisClientType } from 'redis';

import { ENV } from '../config/env';

const redisClient: RedisClientType = createClient({
  url: ENV.REDIS_URL,
});

redisClient.on('error', (error) => {
  console.error('Redis client error:', error);
});

export const ensureRedisConnection = async (): Promise<RedisClientType> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
};

export { redisClient };
