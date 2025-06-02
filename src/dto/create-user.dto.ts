/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

//enables user to share createuserdto to access in multiple files
export class CreateUserDto {
  @IsNotEmpty()
  name: string;




  
  @IsOptional()
  address?: string;

  @IsOptional() 
  age?: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

}
