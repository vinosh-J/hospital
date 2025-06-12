/* eslint-disable prettier/prettier */
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  age?: number;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(['doctor', 'patient'])
  @IsOptional()
  usertype: 'doctor' | 'patient';

  @IsOptional()
  hospital?: string;

  @IsOptional()
  @IsString()
  identifier?: string;



}
