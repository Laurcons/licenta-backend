import { Body, Injectable } from '@nestjs/common';
import { GoogleTokenDto } from './dtos/google-token.dto';
import jwksClient, { JwksClient } from 'jwks-rsa';
import jwt, { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private googleJwksClient: JwksClient;

  constructor() {
    this.googleJwksClient = jwksClient({
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    });
  }

  async validateGoogleToken(token: string) {
    return new Promise<JwtPayload>((res, rej) => {
      const getKey = (header: any, callback: any) => {
        this.googleJwksClient.getSigningKey(header.kid).then((key) => {
          callback(null, key.getPublicKey());
        });
      };
      jwt.verify(token, getKey, (err, decoded) => {
        if (err) return rej(err);
        res(decoded as JwtPayload);
      });
    });
  }
}
