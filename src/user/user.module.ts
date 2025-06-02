import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { user, userschema } from './user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: user.name, schema: userschema }]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // export if AuthModule needs it
})
export class UserModule {}
