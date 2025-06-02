/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { user, userdocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(user.name) private readonly userModel: Model<userdocument>,
  ) {}

  async create(data: CreateUserDto & {
  usertype: 'doctor' | 'patient';
  hospital: string;
}): Promise<userdocument> {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = new this.userModel({
    ...data,
    hospital: new Types.ObjectId(data.hospital), // ✅ conversion here only
    password: hashedPassword,
  });

  return newUser.save();
}


  async findbyemail(email: string): Promise<userdocument | null> {
    const userDoc = await this.userModel.findOne({ email }).select('+password');
    return userDoc;
  }

  async findallbytype(
  userType: 'doctor' | 'patient',
  hospitalId?: Types.ObjectId | string,
): Promise<user[]> {
  const filter: { usertype: 'doctor' | 'patient'; hospital?: Types.ObjectId } = {
    usertype: userType,
  };

  if (hospitalId) {
    filter.hospital = new Types.ObjectId(hospitalId); // ✅ explicit conversion
  }

  const users = await this.userModel.find(filter).select('-password').exec();
  return users;
}


  async updateUser(id: string, updateUserDto: Partial<userdocument>): Promise<userdocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} has been deleted.` };
  }
}
