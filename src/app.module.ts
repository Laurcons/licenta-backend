import { Module } from '@nestjs/common';
import { GtfsModule } from './modules/gtfs/gtfs.module';

@Module({
  imports: [GtfsModule],
})
export class AppModule {}
