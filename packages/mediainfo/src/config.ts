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

export const VERSION = '0.0.1'; // data version is not package version, update only if any changes for data

export const PORT = parseIntEnv(process.env.PORT, 3000);
