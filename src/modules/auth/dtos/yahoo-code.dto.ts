import { IsString } from 'class-validator';

export class YahooCodeDto {
  @IsString()
  code: string;
}
