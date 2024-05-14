import { ShareInfo } from '@airlookjs/shared';
import dotenv from 'dotenv';
dotenv.config();

//import { ShareInfo } from '../../libs/common/config';
export interface SceneDetectConfig {
	environment: string;
	route: string;
	shares: ShareInfo[];
	version: string;
	port: number;
}

// parse bools from env safely
/*const parseBoolEnv = (env: string | undefined, defaultValue: boolean) => {
	if (env === undefined) {
		return defaultValue;
	}
	if (env === 'true') {
		return true;
	}
	if (env === 'false') {
		return false;
	}
	return defaultValue;
};*/

// parse ints from env safely
const parseIntEnv = (env: string | undefined, defaultValue: number) => {
	if (env === undefined) {
		return defaultValue;
	}
	const parsed = parseInt(env);
	if (isNaN(parsed)) {
		return defaultValue;
	}
	return parsed;
};

export const config: SceneDetectConfig = {
	environment: process.env.NODE_ENV ?? 'development',
	version: process.env.npm_package_version ?? 'dev',
	port: parseIntEnv(process.env.PORT, 3000),
	route: process.env.ROUTE ?? '/api/scenedetect',
	shares: []
};
