import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { config } from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtSecret,
    } as StrategyOptionsWithRequest);
  }

  async validate(payload: any) {
    return await this.authService.getUserFromTokenPayload(payload);
  }
}
