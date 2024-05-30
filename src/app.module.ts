import { Module } from '@nestjs/common';
import { GtfsModule } from './modules/gtfs/gtfs.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [GtfsModule, AuthModule],
  controllers: [],
})
export class AppModule {}
