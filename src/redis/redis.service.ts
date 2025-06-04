/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {

    console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL);
  console.log('Redis Token:', process.env.UPSTASH_REDIS_REST_TOKEN);
  
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async increment(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async get(key: string): Promise<number | null> {
    return await this.redis.get<number>(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, { ex: ttlSeconds });
  }
}
