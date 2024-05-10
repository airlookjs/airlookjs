import dotenv from "dotenv";
dotenv.config();
//import getSharedConfig from 'shared-config';
export interface ShareInfo {
  name: string;
  localizedName: string;
  mount: string;
  uncRoot: string;
  cached: boolean;
  systemRoot: string
  matches: RegExp[];
};
export interface LoudnessConfig {
  environment: string;
  route: string;
  shares: ShareInfo[];
  version: string;
  port: number;
};

// parse bools from env safely
/*const parseBoolEnv = (env: string | undefined, defaultValue: boolean) => {
	if (env === undefined) {
		return defaultValue
	}
	if (env === 'true') {
		return true
	}
	if (env === 'false') {
		return false
	}
	return defaultValue
}*/

// parse ints from env safely
const parseIntEnv = (env: string | undefined, defaultValue: number) => {
	if (env === undefined) {
		return defaultValue
	}
	const parsed = parseInt(env)
	if (isNaN(parsed)) {
		return defaultValue
	}
	return parsed
}

export const config: LoudnessConfig = {
	environment: process.env.NODE_ENV || 'development',
	version: process.env.npm_package_version || 'dev',
	port: parseIntEnv(process.env.PORT, 3000),
	route: process.env.ROUTE || '/api/loudness',
	shares: []
};

export const LOUDNESS_CMD = process.env.LOUDNESS_CMD || './bin/loudness';