import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Trip, TripSchema } from './trip.schema';

@Schema({
  timestamps: true,
})
export class User {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [TripSchema] })
  trips: Trip[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
