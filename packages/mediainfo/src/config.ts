import { parseIntEnv, type CommonServiceConfig } from '@airlookjs/shared';
// TODO: parse config file to docker image to set up shares

export interface MediainfoConfig extends CommonServiceConfig {
    mediainfo: {
        defaultOutputFormat: string;
        cacheDir: string;
    }
}

export const config : MediainfoConfig = {
  routePrefix: process.env.ROUTE_PREFIX ?? '/api',
  shares: [],
  mediainfo: {
	  defaultOutputFormat: process.env.DEFAULT_OUTPUT_FORMAT ?? 'EBUCore_JSON',
    cacheDir: '.cache/mediainfo',
  },
}

export const VERSION = process.env.npm_package_version ?? 'dev';
export const PORT = parseIntEnv(process.env.PORT, 3000);
