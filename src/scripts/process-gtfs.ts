import { NestFactory } from '@nestjs/core';
import { GtfsModule } from 'src/modules/gtfs/gtfs.module';
import { GtfsService } from 'src/modules/gtfs/gtfs.service';

async function run() {
  const app = await NestFactory.createApplicationContext(GtfsModule);
  const gtfs = app.get(GtfsService);

  await gtfs.downloadCurrentTripInformation();
}

run();
