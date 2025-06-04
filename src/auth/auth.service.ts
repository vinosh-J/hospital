/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { userdocument } from '../user/user.schema';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Validates the user with email and password
   * Handles login throttling using Redis
   */
  async validateUser(email: string, password: string): Promise<userdocument> {
    console.log('⏩ Login attempt:', email);

    const MAX_ATTEMPTS = 5;
    const BLOCK_TIME = 15 * 60; // 15 minutes in seconds
    const blockKey = `block:${email}`;
    const attemptsKey = `login_attempts:${email}`;

    // 🔒 Check if user is blocked
    const isBlocked = await this.redisService.get(blockKey);
    if (isBlocked) {
      throw new UnauthorizedException('Too many failed attempts. Try again after 15 minutes.');
    }

    // 🔍 Try fetching user
    const userDoc = await this.userService.findbyemail(email);
    console.log('🔍 Fetched user:', userDoc);

    if (!userDoc) {
      // Count failed attempt
      await this.trackFailedLogin(email, attemptsKey, blockKey, MAX_ATTEMPTS, BLOCK_TIME);
      throw new UnauthorizedException('Invalid email or password');
    }

    // 🔑 Compare passwords
    const isMatch = await bcrypt.compare(password, userDoc.password);
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      await this.trackFailedLogin(email, attemptsKey, blockKey, MAX_ATTEMPTS, BLOCK_TIME);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Success - clear failed attempts
    await this.redisService.del(attemptsKey);

    return userDoc;
  }

  /**
   * Generates a JWT token for the authenticated user
   */
  login(user: userdocument): { access_token: string } {
  const payload = {
    sub: (user._id as Types.ObjectId).toString(),
    email: user.email,
    usertype: user.usertype,
    hospital: user.hospital.toString(),
  };

  return {
    access_token: this.jwtService.sign(payload),
  };
}


  /**
   * Tracks failed login attempts and blocks user if exceeded limit
   */
  private async trackFailedLogin(
    email: string,
    attemptsKey: string,
    blockKey: string,
    maxAttempts: number,
    blockTime: number,
  ) {
    const attempts = await this.redisService.increment(attemptsKey);

    if (attempts === 1) {
      await this.redisService.expire(attemptsKey, blockTime);
    }

    if (attempts >= maxAttempts) {
      await this.redisService.set(blockKey, '1', blockTime);
    }
  }
}
