import { IsString } from 'class-validator';

export class EmailPasswordDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
