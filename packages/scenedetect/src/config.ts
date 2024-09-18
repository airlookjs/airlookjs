import { parseIntEnv, type CommonServiceConfig } from '@airlookjs/shared';
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

export const VERSION = '0.0.1'; // data version is not package version, update only if any changes for data
export const PORT = parseIntEnv(process.env.PORT, 3000);
