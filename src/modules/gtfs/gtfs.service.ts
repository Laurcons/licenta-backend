import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import axios from 'axios';
import { config } from 'src/config';

@Injectable()
export class GtfsService {
  #logger = new Logger('GtfsService');

  constructor() {}

  async #downloadFile(fileUrl: string, outputLocationPath: string) {
    const writer = createWriteStream(outputLocationPath);

    return axios
      .get(fileUrl, {
        responseType: 'stream',
      })
      .then((response) => {
        //ensure that the user can call `then()` only when the file has
        //been downloaded entirely.

        return new Promise<void>((resolve, reject) => {
          response.data.pipe(writer);
          let error: any = null;
          writer.on('error', (err) => {
            error = err;
            writer.close();
            reject(err);
          });
          writer.on('close', () => {
            if (!error) {
              resolve();
            }
            //no need to call the reject here, as it will have been called in the
            //'error' stream;
          });
        });
      });
  }

  #exists(path: string) {
    return fs
      .access(path)
      .then(() => true)
      .catch((err) => false);
  }

  async downloadCurrentTripInformation() {
    const {
      getAgencies,
      getCalendarDates,
      getCalendars,
      getRoutes,
      getStops,
      getStoptimes,
      getTrips,
      importGtfs,
    } = await import('gtfs');
    this.#logger.log('Begin update trip data');
    const localPrefix = './trip-data/';
    if (await this.#exists(localPrefix)) {
      await fs.rm(localPrefix, { recursive: true });
    }
    await fs.mkdir(localPrefix);
    await fs.mkdir(localPrefix + 'gtfs');
    // download files
    const { prefix, files } = config.gtfs;
    let done = 1;
    const total = files.length;
    await Promise.all(
      files.map((fileName) =>
        this.#downloadFile(
          `${prefix}${fileName}.txt`,
          `${localPrefix}gtfs/${fileName}.txt`,
        ).then(() =>
          this.#logger.log(`[${done++}/${total}] Downloaded ${fileName}.txt`),
        ),
      ),
    );
    // await importGtfs({
    //   agencies: [{ path: `${localPrefix}gtfs/` }],
    // });
    // const obj = {
    //   agencies: getAgencies(),
    //   calendars: getCalendars(),
    //   calendarDates: getCalendarDates(),
    //   routes: getRoutes(),
    //   stopTimes: getStoptimes(),
    //   stops: getStops(),
    //   trips: getTrips(),
    // };
    // this.#logger.log('Writing JSON');
    // await fs.writeFile(`${localPrefix}data.json`, JSON.stringify(obj, null, 2));
  }
}
