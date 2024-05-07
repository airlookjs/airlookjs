import dotenv from "dotenv";
// @ts-expect-error not defined in project yet
import getSharedConfig from 'shared-config';

export interface ShareInfo {
  name: string;
  localizedName: string;
  mount: string;
  uncRoot: string;
  cached: boolean;
  systemRoot: string
  matches: RegExp[];
};

export type ShareRecord = Record<string, ShareInfo>;

export interface SharedConfig {
  shares: ShareRecord;
  environment: string;
  printVersion: () => void;
}
export interface LoudnessConfig {
  environment: string;
  route: string;
  shares: ShareInfo[];
  version: string;
  port: number;
};

dotenv.config();

// parse bools from env safely
const parseBoolEnv = (env: string | undefined, defaultValue: boolean) => {
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
}

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

const sharedConfig: SharedConfig = getSharedConfig({
	shares: {
		agis: {
			mount: process.env.SHARE_AIRLOOK_MOUNT || '/mnt/agis-store',
			cached: parseBoolEnv(process.env.SHARE_AIRLOOK_CACHED, true)
		}
	},
	environment: process.env.NODE_ENV || 'development'
});

sharedConfig.printVersion()

export const config: LoudnessConfig = {
	environment: process.env.NODE_ENV || 'development',
	version: process.env.npm_package_version || 'dev',
	port: parseIntEnv(process.env.PORT, 3000),
	route: process.env.ROUTE || '/api/loudness',
	shares: Object.values(sharedConfig.shares)
};
