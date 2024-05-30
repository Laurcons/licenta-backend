import { Body, Injectable } from '@nestjs/common';
import { GoogleTokenDto } from './dtos/google-token.dto';
import jwksClient, { JwksClient } from 'jwks-rsa';
import jwt, { JwtPayload } from 'jsonwebtoken';
import axios from 'axios';
import { config } from 'src/config';

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

  async validateYahooToken(code: string) {
    const response = await axios.post<{ access_token: string }>(
      `https://api.login.yahoo.com/oauth2/get_token`,
      {
        client_id: config.auth.yahoo.clientId,
        client_secret: config.auth.yahoo.clientSecret,
        redirect_uri: 'https://cfr.laurcons.ro/auth/yahoo',
        code,
        grant_type: 'authorization_code',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const authToken = response.data.access_token;
    const userResp = await axios.get<{
      email: string;
      given_name: string;
      family_name: string;
    }>(`https://api.login.yahoo.com/openid/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return userResp.data;
  }
}
