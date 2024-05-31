import * as Joi from '@hapi/joi';
import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import 'joi-extract-type';
import { parse } from 'yaml';

const configSchema = Joi.object({
  gtfs: Joi.object({
    prefix: Joi.string().regex(/\\$/).required(),
    files: Joi.array().items(Joi.string()).required(),
  }).required(),
  auth: Joi.object({
    google: Joi.object({
      clientId: Joi.string().required(),
    }).required(),
    yahoo: Joi.object({
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
    }).required(),
  }).required(),
  jwtSecret: Joi.string().required(),
  mongoUri: Joi.string().required(),
});

export type Config = Joi.extractType<typeof configSchema>;

// force typescript to eat it up
export const config: Config = parse(
  readFileSync('./config.yaml', 'utf-8'),
) as Config;

async function load() {
  // do runtime validation to make sure typescript doesn't eat it up wrongly
  const valid = await configSchema.validate(process.env, {
    abortEarly: true,
    // stripUnknown: true,
  });
  Logger.log('Configuration parsed and validated', 'config.ts');
}

load();
