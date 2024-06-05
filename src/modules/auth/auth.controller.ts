import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { YahooCodeDto } from './dtos/yahoo-code.dto';
import { EmailPasswordDto } from './dtos/email-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('password/register')
  async createUser(@Body() body: CreateUserDto) {
    return await this.authService.createUserWithPassword(body);
  }

  @Post('password')
  async validateEmailPassword(@Body() body: EmailPasswordDto) {
    return await this.authService.validateEmailPassword(
      body.email,
      body.password,
    );
  }

  @Post('google')
  async validateGoogle(@Body() body: GoogleTokenDto) {
    const decoded = await this.authService.validateGoogleToken(body.token);
    return decoded;
  }

  @Post('yahoo')
  async validateYahoo(@Body() body: YahooCodeDto) {
    const decoded = await this.authService.validateYahooToken(body.code);
    return decoded;
  }
}
