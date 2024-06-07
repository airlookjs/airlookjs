import { parseIntEnv, type ShareInfo, type CommonServiceConfig } from '@airlookjs/shared';
// TODO: parse config file to docker image to set up shares

export interface MediainfoConfig extends CommonServiceConfig {
    mediainfo: {
        defaultOutputFormatName: string;
    }
}

export const config : MediainfoConfig = {
  routePrefix: process.env.ROUTE_PREFIX ?? '/api',
  shares: [],
  mediainfo: {
	  defaultOutputFormatName: process.env.DEFAULT_OUTPUT_FORMAT ?? 'EBUCore_JSON'
  },
}

export const VERSION = process.env.npm_package_version ?? 'dev';
export const PORT = parseIntEnv(process.env.PORT, 3000);
