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
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }
}
