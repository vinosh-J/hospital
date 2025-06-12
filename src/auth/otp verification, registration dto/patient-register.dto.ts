/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class PatientRegisterDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
