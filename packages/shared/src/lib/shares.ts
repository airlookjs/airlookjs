import path from "node:path";
import fs from 'fs';
export interface ShareInfo {
	name: string;
	//localizedName: string; // TODO: seems to be unused unnecessary to include here
	mount: string;
	uncRoot?: string;
	cached: boolean;
	systemRoot?: string;
	matches: RegExp[];
}

export const matchShare = (searchPath: string, share: ShareInfo) : false | string => {
  for (const match of share.matches) {
    const matchResult = searchPath.match(match)
    if (matchResult?.[1]) {
      return matchResult[1]
    }
  }
  return false
}

export const findPathInShares = (searchPath: string, shares: ShareInfo[]) : {
  share: ShareInfo;
  filePath: string;
} => {
  const matchedShares : ShareInfo[] = [];

  for (const share of shares) {
    const match = matchShare(searchPath, share)
    if (match) {
      matchedShares.push(share)
      const filePath = path.join(share.mount, match)
      if (fs.existsSync(filePath)) {
        return {
          share,
          filePath
        }
      }
    }
  }

  if (matchedShares.length > 0) {
    throw new Error(`File ${searchPath} not found on any matched shares. Matched shares: ${matchedShares.map(share => share.name).join(', ')}`)
  }

  throw new Error(`File ${searchPath} not matching any shares.`)
}

/* TODO
export const findCached = (filePath: string, cacheDir: string) : string => {
}
**/
