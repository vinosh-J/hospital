/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { user, userdocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

interface CreateUserInput {
  name: string;
  email: string;
  age: number;
  address: string;
  password: string;
  usertype: 'doctor' | 'patient';
  hospital?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(user.name)
    private readonly userModel: Model<userdocument>,
  ) {}
  // Used for both doctor and patient creation
  async create(data: CreateUserDto): Promise<userdocument> {
  // Only hash if the password is NOT already a BCrypt hash
  const hashedPassword = data.password.startsWith('$2') 
    ? data.password // Already hashed - use as-is
    : await bcrypt.hash(data.password, 10); // Not hashed → hash it

  const payload = {
    ...data,
    password: hashedPassword, // Use the correct password (hashed or newly hashed)
    hospital: data.hospital ? new Types.ObjectId(data.hospital) : undefined,
  };

  const newUser = new this.userModel(payload);
  return newUser.save();
}

  async findbyemail(email: string): Promise<userdocument | null> {
    return await this.userModel.findOne({ email }).select('+password').exec();
  }

  async findallbytype(
    userType: 'doctor' | 'patient',
    hospitalId?: Types.ObjectId | string,
  ): Promise<user[]> {
    const filter: {
      usertype: 'doctor' | 'patient';
      hospital?: Types.ObjectId;
    } = { usertype: userType };

    if (hospitalId) {
      filter.hospital = new Types.ObjectId(hospitalId);
    }

    return await this.userModel.find(filter).select('-password').exec();
  }

  async updateUser(
    id: string,
    updateUserDto: Partial<Omit<CreateUserInput, 'usertype'>>,
  ): Promise<userdocument> {
    if (!updateUserDto.name) {
      throw new BadRequestException('Name is required for registration');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );

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

  async findByIdentifier(identifier: string): Promise<userdocument | null> {
    return await this.userModel.findOne({ identifier }).exec();
  }
}
