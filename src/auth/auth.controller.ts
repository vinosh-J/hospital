/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Public } from 'auth/pubic.decorator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Public()
@Post('login')
async login(@Body() loginDto: LoginDto): Promise<{ message: string; access_token: string }> {
  const user = await this.authService.validateUser(loginDto.email, loginDto.password);
  const token = this.authService.login(user).access_token;
  return {
    message: 'Login successful',
    access_token: token,
  };
}

@Public()
@Post('send-otp')
async sendOtp(@Body('email') email: string) {
  return this.authService.sendOtp(email);
}

@Public()
@Post('verify-otp')
async verifyOtp(@Body() dto: { email: string; otp: string }) {
  return this.authService.verifyOtp(dto.email, dto.otp);
}

@Public()
@Post('reset-password')
async resetPassword(@Body() dto: { email: string; otp: string; newPassword: string }) {
  return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
}

}
