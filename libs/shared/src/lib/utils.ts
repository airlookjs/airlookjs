export interface ShareInfo {
	name: string;
	//localizedName: string; // TODO: seems to be unused unnecessary to include here
	mount: string;
	uncRoot: string;
	cached: boolean;
	systemRoot: string;
	matches: RegExp[];
}

// parse ints from env safely
export const parseIntEnv = (env:  string | undefined, defaultValue: number) : number => {
	if (env === undefined) {
		return defaultValue;
	}
	const parsed = parseInt(env);
	if (isNaN(parsed)) {
		return defaultValue;
	}
	return parsed;
};

// parse bools from env safely
export const parseBoolEnv = (env: string | undefined, defaultValue: boolean) : boolean => {
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
};