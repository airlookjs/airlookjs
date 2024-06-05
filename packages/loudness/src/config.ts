import dotenv from "dotenv";
dotenv.config();

// load loudness.config.ts or loudness.config.js if present - otherwise use defaults or env - .ts needs to be compiled to .js
//if(fs.existsSync('../loudness.config.ts')) {
//import configfile from '../loudness.config.ts';
import { parseIntEnv, type ShareInfo } from '@airlookjs/shared';
export interface LoudnessConfig {
  routePrefix: string;
  shares: ShareInfo[];
};

export const defaultConfig: LoudnessConfig = {
	routePrefix: process.env.ROUTE ?? '/api',
	shares: []
};

export const VERSION = process.env.npm_package_version ?? 'dev';
export const PORT = parseIntEnv(process.env.PORT, 3000);
export const DEFAULT_SAMPLE_RATE = 0.02;
export const CACHE_DIR = '.cache/loudness';
