import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthProvider, User, UserDocument } from './models/user';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Trip } from './models/trip.schema';

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

  async addTripToUser(user: User, trip: Partial<Trip>) {
    const newUser = await this.userModel.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          trips: trip,
        },
      },
      { new: true },
    );
    return newUser!.trips.at(-1);
  }

  async removeTripFromUser(user: User, tripId: string | Types.ObjectId) {
    tripId = new mongoose.Types.ObjectId(tripId);
    const trip = user.trips.find((t) => t._id.equals(tripId));
    if (!trip) throw new HttpException('Could not find trip id ' + tripId, 404);
    await this.userModel.deleteOne({
      _id: trip._id,
    });
    return trip;
  }
}
