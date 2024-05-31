import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findByEmailOrCreate(email: string, name: string): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(
        {
          email,
        },
        {
          $set: {
            email,
            name,
          },
        },
        {
          upsert: true,
        },
      )
      .then((u) => u!);
  }
}
