import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { YahooCodeDto } from './dtos/yahoo-code.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async validateGoogle(@Body() body: GoogleTokenDto) {
    const decoded = await this.authService.validateGoogleToken(body.token);
    return {
      valid: true,
      decoded,
    };
  }

  @Post('yahoo')
  async validateYahoo(@Body() body: YahooCodeDto) {
    const decoded = await this.authService.validateYahooToken(body.code);
    return {
      valid: true,
      decoded,
    };
  }
}
