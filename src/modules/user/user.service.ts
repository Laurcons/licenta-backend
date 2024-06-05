import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthProvider, User, UserDocument } from './models/user';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findByProviderEmailOrCreate(
    email: string,
    name: string,
    provider: AuthProvider,
    providerId: string,
  ): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(
        {
          email,
        },
        {
          $set: {
            email,
            name,
            authProvider: provider,
            providerId,
          },
        },
        {
          upsert: true,
          new: true,
        },
      )
      .then((u) => u!);
  }

  async createUser(data: { email: string; name: string; password: string }) {
    const existing = await this.getByEmail(data.email);
    if (existing) {
      throw new HttpException('Email already exists!', 422);
    }
    return await this.userModel.create({
      email: data.email,
      password: data.password,
      name: data.name,
      authProvider: AuthProvider.password,
    });
  }

  async getUserTrips(user: User) {
    return user.trips;
  }
}
