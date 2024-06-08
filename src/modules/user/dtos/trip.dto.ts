import { Transform } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class TripDto {
  @IsString()
  destinationId: string;

  @IsString()
  trainNum: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  date: Date;
}
