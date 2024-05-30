import { IsJWT, IsString } from 'class-validator';

export class GoogleTokenDto {
  @IsString()
  @IsJWT()
  token: string;
}
