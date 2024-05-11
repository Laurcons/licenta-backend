import { Module } from '@nestjs/common';
import { GtfsService } from './gtfs.service';

@Module({
  providers: [GtfsService],
})
export class GtfsModule {}
