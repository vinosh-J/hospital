/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { userdocument } from '../user/user.schema';
import { Types } from 'mongoose';  // <-- Import Types

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<userdocument> {
  console.log('⏩ Login attempt:', email);

  const userDoc = await this.userService.findbyemail(email);
  console.log('🔍 Fetched user:', userDoc);

  if (!userDoc) {
    throw new UnauthorizedException('User not found');
  }

  const isMatch = await bcrypt.compare(password, userDoc.password);
  console.log(' Password match:', isMatch);

  if (!isMatch) {
    throw new UnauthorizedException('Invalid password');
  }

  return userDoc;
}

  login(user: userdocument): { access_token: string } {
    const payload = {
      // Cast _id as Types.ObjectId and call toString()
      sub: (user._id as Types.ObjectId).toString(),
      email: user.email,
      usertype: user.usertype,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
