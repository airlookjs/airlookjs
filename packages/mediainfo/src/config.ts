import { type ShareInfo } from '@airlookjs/shared';

// parse bools from env safely
/*const parseBoolEnv = (env, defaultValue) => {
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

/*const sharedConfig = getSharedConfig({
	shares: {
		agis: {
			mount: process.env.SHARE_AIRLOOK_MOUNT || '/mnt/agis-store',
			cached: parseBoolEnv(process.env.SHARE_AIRLOOK_CACHED, true)
		}
	},
})*/

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
