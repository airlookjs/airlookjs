import { parseIntEnv, type ShareInfo } from '@airlookjs/shared';

// TODO: parse config file to docker image to set up shares

export const config : {
    version: string,
    port: number,
    route: string,
    defaultOutputFormatName: string,
    shares: ShareInfo[]
} = {
	version: process.env.npm_package_version ?? 'dev',
	port: parseIntEnv(process.env.PORT, 3000),
	route: process.env.ROUTE_PREFIX ?? '/api/mediainfo',
	defaultOutputFormatName: process.env.DEFAULT_OUTPUT_FORMAT ?? 'EBUCore_JSON',
	shares: []
}
