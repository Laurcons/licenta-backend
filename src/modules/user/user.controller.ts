import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqUser } from '../auth/req-user.decorator';
import { User } from './models/user';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getMe(@ReqUser() user: User) {
    return { user: await this.userService.getByEmail(user.email) };
  }

  @Get('me/trips')
  async getTrips(@ReqUser() user: User) {
    return { trips: await this.userService.getUserTrips(user) };
  }
}
