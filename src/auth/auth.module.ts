import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller'; // ✅ Import the controller
import { UserModule } from '../user/user.module';
import { RedisService } from 'src/redis/redis.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientModule } from 'src/patients/patient.module';
import { Patient, PatientSchema } from 'src/patients/patient.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    PatientModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'your_jwt_secret',
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
  ],
  controllers: [AuthController], // ✅ Register the controller
  providers: [AuthService, JwtStrategy, RedisService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
