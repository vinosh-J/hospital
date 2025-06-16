/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Injectable, Logger, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import { PatientService } from '../patients/patient.service';
import { userdocument } from '../user/user.schema';
import { JwtPayload } from 'auth/interface ( otp process )/jwt-payload.interface';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly patientService: PatientService,
  ) {}

  async validateUser(email: string, password: string): Promise<userdocument> {
    const MAX_ATTEMPTS = 5;
    const BLOCK_TIME = 15 * 60;
    const blockKey = `block:${email}`;
    const attemptsKey = `login_attempts:${email}`;

    const isBlocked = await this.redisService.get(blockKey);
    if (isBlocked) {
      throw new UnauthorizedException('Too many failed attempts. Try again after 15 minutes.');
    }

    const user = await this.userService.findbyemail(email);
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await this.trackFailedLogin(email, attemptsKey, blockKey, MAX_ATTEMPTS, BLOCK_TIME);
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.redisService.del(attemptsKey);
    return user;
  }

  login(user: userdocument): { access_token: string } {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      usertype: user.usertype,
      hospital: user.hospital?.toString() || '',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

   async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private async trackFailedLogin(email: string, attemptsKey: string, blockKey: string, maxAttempts: number, blockTime: number) {
    const attempts = await this.redisService.increment(attemptsKey);
    if (attempts === 1) await this.redisService.expire(attemptsKey, blockTime);
    if (attempts >= maxAttempts) await this.redisService.set(blockKey, '1', blockTime);
  }

  async sendOtpToUser(email: string) {
    const user = await this.userService.findbyemail(email);
    if (!user) throw new NotFoundException('User not found');
    await this._sendOtpFlow(email);
  }

  async sendOtpToPatient(email: string) {
    await this._sendOtpFlow(email);
  }

  private async _sendOtpFlow(email: string) {
    const cooldownKey = `otp_cooldown:${email}`;
    const existingCooldown = await this.redisService.get(cooldownKey);
    if (existingCooldown) {
      throw new BadRequestException('Please wait before requesting another OTP');
    }

    const otp = this.generateOtp();
    const otpKey = `otp:${email}`;

    await this.redisService.set(otpKey, otp, 300);
    await this.redisService.set(cooldownKey, '1', 60);
    await this.sendOtpEmail(email, otp);

    this.logger.log(`OTP sent to ${email}: ${otp}`);
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const savedOtp = await this.redisService.get(`otp:${email}`);
    if (!savedOtp || savedOtp.toString() !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.userService.findbyemail(email);
    if (!user) throw new NotFoundException('User not found');

    if (!this.isStrongPassword(newPassword)) {
      throw new BadRequestException(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await this.redisService.del(`otp:${email}`);
    return { message: 'Password successfully reset' };
  }

  private isStrongPassword(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  }

 async requestOtpByIdentifier(identifier: string): Promise<{ message: string }> {
  this.logger.log('Request received for identifier: ' + identifier);

  const patient = await this.patientService.findByIdentifier(identifier);
  if (!patient) {
    this.logger.warn(`No patient found for identifier: ${identifier}`);
    throw new NotFoundException('Patient not found');
  }

  const blockKey = `otp:block:${identifier}`;
  const countKey = `otp:count:${identifier}`;

  // Check if patient is blocked from requesting OTP
  const isBlocked = await this.redisService.get(blockKey);
  if (isBlocked) {
    throw new BadRequestException('Too many OTP requests. Please try again after 5 minutes.');
  }

  // Get the number of OTP requests made
  const count = await this.redisService.get(countKey);
  const requestCount = count ? parseInt(count.toString()) : 0;

  // If the limit is reached, block the user for 5 minutes
  if (requestCount >= 5) {
    await this.redisService.set(blockKey, 'blocked', 300); // 5 minutes block
    await this.redisService.del(countKey); // reset count after blocking
    throw new BadRequestException('Too many OTP requests. You are temporarily blocked for 5 minutes.');
  }

  try {
    // Send OTP to the patient’s email
    await this.sendOtpToPatient(patient.email);

    // Increment the count and reset the expiry timer to 5 minutes
    await this.redisService.set(countKey, (requestCount + 1).toString(), 300 );
  } catch (error) {
    this.logger.error('Error while sending OTP:', error);
    if (error instanceof BadRequestException) {
  throw error; // propagate expected validation error
}
throw new InternalServerErrorException('Failed to send OTP');

  }

  return { message: 'OTP sent to email' };
}

  async verifyOtpAndGenerateJwt(email: string, otp: string): Promise<{ access_token: string }> {
  const savedOtp = await this.redisService.get(`otp:${email}`);
  
  if (!savedOtp || savedOtp.toString() !== otp) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  const patient = await this.patientService.findByEmail(email);
  if (!patient) {
    throw new NotFoundException('Patient not found');
  }

  const payload: JwtPayload = {
    name: patient.name,
    email: patient.email,
    identifier: patient.identifier,
  };

  // Clear OTP and reset the rate limit and block keys
  await this.redisService.del(`otp:${email}`);
  await this.redisService.del(`otp:count:${patient.identifier}`);
  await this.redisService.del(`otp:block:${patient.identifier}`);

  const access_token = this.jwtService.sign(payload);

  return { access_token };
}



  async registerPatient(data: {
  email: string;
  name: string;
  identifier: string;
  age: number;
  address: string;
  password: string;
  hospitalId: string;
}) {
  console.log('Registering patient with identifier:', data.identifier);

  // Check if a patient exists in the temporary patients collection
  const existingPatient = await this.patientService.findByIdentifier(data.identifier);
  if (!existingPatient) {
    throw new NotFoundException('Patient not found in database');
  }

  // Now check if this patient is already registered in users
  const existingUser = await this.userService.findbyemail(data.email);
  if (existingUser) {
    throw new BadRequestException('Patient already registered');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await this.userService.create({
    name: data.name,
    email: data.email,
    identifier: data.identifier,
    password: hashedPassword,
    address: data.address,
    age: data.age,
    usertype: 'patient',
    hospital: data.hospitalId,
  });

  await this.patientService.updateStatusByIdentifier(data.identifier, 'active');

  return {
    message: 'Patient registration completed',
    userId: user._id,
  };
}


}
