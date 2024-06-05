import { HttpException, Injectable } from '@nestjs/common';
import jwksClient, { JwksClient } from 'jwks-rsa';
import jwt, { JwtPayload } from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { config } from 'src/config';
import { UserService } from '../user/user.service';
import { AuthProvider, User } from '../user/models/user';

@Injectable()
export class AuthService {
  private googleJwksClient: JwksClient;

  constructor(private userService: UserService) {
    this.googleJwksClient = jwksClient({
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    });
  }

  async authTokenForProviderEmail(
    email: string,
    name: string,
    provider: AuthProvider,
    providerId: string,
  ) {
    // find user (or create user)
    const user = await this.userService.findByProviderEmailOrCreate(
      email,
      name,
      provider,
      providerId,
    );
    // generate auth token
    const authToken = jwt.sign(
      {
        email: user.email,
        _id: user._id,
      },
      config.jwtSecret,
    );
    return { user, authToken };
  }

  async createUserWithPassword(data: {
    email: string;
    name: string;
    password: string;
  }) {
    const user = await this.userService.createUser(data);
    return await this.authTokenForEmailPassword(user);
  }

  async authTokenForEmailPassword(user: User) {
    // generate auth token
    const authToken = jwt.sign(
      {
        email: user.email,
        _id: user._id,
      },
      config.jwtSecret,
    );
    return { user, authToken };
  }

  async getUserFromTokenPayload(payload: { email: string; _id: string }) {
    return await this.userService.getByEmail(payload.email);
  }

  async validateEmailPassword(email: string, password: string) {
    const user = await this.userService.getByEmail(email);
    if (!user || !user.password || !bcrypt.compareSync(password, user.password))
      throw new HttpException('Email or password incorrect', 404);
    return await this.authTokenForEmailPassword(user);
  }

  async validateGoogleToken(token: string) {
    const decoded = await new Promise<JwtPayload>((res, rej) => {
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
    // sanity checks (recommended by Google)
    // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
    if (decoded.aud !== config.auth.google.clientId) {
      throw new Error(
        'Could not login with Google: invalid audience / client id: ' +
          decoded.aud,
      );
    }
    if (
      decoded.iss !== 'accounts.google.com' &&
      decoded.iss !== 'https://accounts.google.com'
    ) {
      throw new Error(
        'Could not login with Google: invalid issuer: ' + decoded.iss,
      );
    }
    return await this.authTokenForProviderEmail(
      decoded.email,
      `${decoded.family_name} ${decoded.given_name}`,
      AuthProvider.google,
      decoded.id,
    );
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
    const yahooAuthToken = response.data.access_token;
    const userResp = await axios.get<{
      id: string;
      email: string;
      given_name: string;
      family_name: string;
    }>(`https://api.login.yahoo.com/openid/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${yahooAuthToken}`,
      },
    });
    // we don't need the Yahoo auth token anymore
    return await this.authTokenForProviderEmail(
      userResp.data.email,
      `${userResp.data.family_name} ${userResp.data.given_name}`,
      AuthProvider.yahoo,
      userResp.data.id,
    );
  }
}
