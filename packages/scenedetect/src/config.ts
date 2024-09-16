import { parseIntEnv, type CommonServiceConfig } from '@airlookjs/shared';
import {version} from '../package.json';
export interface SceneDetectConfig extends CommonServiceConfig {
	scenedetect: {
		cacheDir: string
	}
}

export const config : SceneDetectConfig = {
  routePrefix: process.env.ROUTE_PREFIX ?? '/api',
  shares: [],
  scenedetect: {
    cacheDir: '.cache/scenedetect',
  },
}

export const VERSION = version;// process.env.npm_package_version ?? 'dev';
export const PORT = parseIntEnv(process.env.PORT, 3000);
