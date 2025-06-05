/* eslint-disable prettier/prettier */
import  nodemailer  from 'nodemailer';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async sendOtp(email: string) {
    const user = await this.userService.findbyemail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cooldownKey = `otp_cooldown:${email}`;
    const existingCooldown = await this.redisService.get(cooldownKey);
    if (existingCooldown) {
      throw new BadRequestException('Please wait before requesting another OTP');
    }

    const otp = this.generateOtp();
    const otpKey = `otp:${email}`;

    await this.redisService.set(otpKey, otp, 300); // 5 min OTP expiry
    await this.redisService.set(cooldownKey, '1', 60); // 60 sec cooldown

    await this.sendOtpEmail(email, otp);

    return { message: 'OTP sent to email' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Your OTP for password reset',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
  const savedOtp = await this.redisService.get(`otp:${email}`);
  if (savedOtp?.toString() === otp) {
    await this.redisService.del(`otp:${email}`);
    return true;
  }
  throw new BadRequestException('Invalid or expired OTP');
}

async resetPassword(email: string, otp: string, newPassword: string) {
  const savedOtp = await this.redisService.get(`otp:${email}`);

  if (!savedOtp || savedOtp?.toString() !== otp) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  const user = await this.userService.findbyemail(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!this.isStrongPassword(newPassword)) {
  throw new BadRequestException(
    'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  );
}

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  await this.redisService.del(`otp:${email}`); // cleanup OTP
  return { message: 'Password successfully reset' };
}

private isStrongPassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

}