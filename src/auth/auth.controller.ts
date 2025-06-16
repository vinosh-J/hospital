/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/dto/login.dto';
import { Public } from 'auth/pubic.decorator';
import { RequestOtpDto } from './otp verification, registration dto/request-otp.dto';
import { VerifyOtpDto } from './otp verification, registration dto/verify-otp.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { Headers    } from '@nestjs/common';
import { PatientRegisterDto } from './otp verification, registration dto/patient-register.dto';
import { JwtRequest } from './interface ( otp process )/jwt-request-interface';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ message: string; access_token: string }> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const token = (this.authService.login(user)).access_token;
    return {
      message: 'Login successful',
      access_token: token,
    };
  }

 @Public()
@Post('send-otp')
async sendOtpToUser(@Body('email') email: string) {
  await this.authService.sendOtpToUser(email);
  return { message: 'OTP sent successfully' };
}


  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: { email: string; otp: string; newPassword: string },
  ) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Public()
  @Post('otp/request')
  async requestOtpByIdentifier(@Body() body: RequestOtpDto) {
    return this.authService.requestOtpByIdentifier(body.identifier);
  }

  @Public()
  @Post('otp/verify')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtpAndGenerateJwt(body.email, body.otp);
  }

@Post('patient/register')
@UseGuards(JwtAuthGuard)
async registerPatient(
  @Req() req: JwtRequest,
  @Headers('x-tenant-id') hospitalId: string,
  @Body() body: PatientRegisterDto,
) {
  const user = req.user;

  if (!hospitalId) {
    throw new BadRequestException('Hospital ID missing in headers');
  }

  return this.authService.registerPatient({
    email: user.email,
    name: user.name,
    identifier: user.identifier,
    age: body.age,
    address: body.address,
    password: body.password,
    hospitalId,
  });
}
}
  



