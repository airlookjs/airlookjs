export interface ShareInfo {
	name: string;
	//localizedName: string; // TODO: seems to be unused unnecessary to include here
	mount: string;
	uncRoot: string;
	cached: boolean;
	systemRoot: string;
	matches: RegExp[];
}
