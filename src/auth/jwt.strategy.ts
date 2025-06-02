/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  usertype: 'doctor' | 'patient';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // ✅ FIX: set strategy name to 'jwt'
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_jwt_secret', // Load from .env in real apps
    });
  }

  validate(payload: JwtPayload) {
    console.log('JWT payload in validate():', payload); 
    return {
      userId: payload.sub,
      email: payload.email,
      usertype: payload.usertype,
    };
  }
}
