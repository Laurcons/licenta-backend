import { Module } from '@nestjs/common';
import { GtfsModule } from './modules/gtfs/gtfs.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUri),
    GtfsModule,
    AuthModule,
    UserModule,
  ],
  controllers: [],
})
export class AppModule {}
