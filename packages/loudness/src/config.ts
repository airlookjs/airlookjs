import dotenv from "dotenv";
dotenv.config();

// load loudness.config.ts or loudness.config.js if present - otherwise use defaults or env - .ts needs to be compiled to .js
//if(fs.existsSync('../loudness.config.ts')) {
//import configfile from '../loudness.config.ts';
import { parseIntEnv, type ShareInfo } from '@airlookjs/shared';
import path from "node:path";

export interface LoudnessConfig {
  environment: string;
  route: string;
  shares: ShareInfo[];
  version: string;
  port: number;
};

export const config: LoudnessConfig = {	
	environment: process.env.NODE_ENV ?? 'development',
	version: process.env.npm_package_version ?? 'dev',
	port: parseIntEnv(process.env.PORT, 3000),
	route: process.env.ROUTE ?? '/api/loudness',
	shares: []
};

export const LOUDNESS_CMD = path.resolve(import.meta.dirname, '../bin/loudness');