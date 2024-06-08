import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqUser } from '../auth/req-user.decorator';
import { User } from './models/user';
import { TripDto } from './dtos/trip.dto';

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

  @Post('me/trips')
  async addTrip(@ReqUser() user: User, @Body() body: TripDto) {
    return { trip: await this.userService.addTripToUser(user, body) };
  }

  @Delete('me/trips/:id')
  async deleteTrip(@ReqUser() user: User, @Param('id') id: string) {
    return { trip: await this.userService.removeTripFromUser(user, id) };
  }
}
