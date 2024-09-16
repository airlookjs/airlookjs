import dotenv from "dotenv";
dotenv.config();
import {version} from '../package.json';

// load loudness.config.ts or loudness.config.js if present - otherwise use defaults or env - .ts needs to be compiled to .js
//if(fs.existsSync('../loudness.config.ts')) {
//import configfile from '../loudness.config.ts';

import { CommonServiceConfig, parseIntEnv } from '@airlookjs/shared';

export interface LoudnessConfig extends CommonServiceConfig {
  loudness: {
    defaultSampleRate: number;
    cacheDir: string;
  }
};

export const config: LoudnessConfig = {
	routePrefix: process.env.ROUTE_PREFIX ?? '/api',
	shares: [],
  rateLimit: {
    max: parseIntEnv(process.env.RATE_LIMIT_MAX, 50),
    timeWindow: process.env.RATE_LIMIT_TIME_WINDOW ?? '1 minute'
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*'
  },
  loudness: {
    defaultSampleRate: parseFloat(process.env.DEFAULT_SAMPLE_RATE ?? '0.02'),
    cacheDir: '.cache/loudness',
  }
};

export const VERSION = version; //process.env.npm_package_version ?? 'dev';
export const PORT = parseIntEnv(process.env.PORT, 3000);

