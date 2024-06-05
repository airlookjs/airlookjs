import { pipeline } from 'node:stream/promises';
import got from 'got';
import { v4 as uuid } from 'uuid';
import { FileNotFoundError } from './FileNotFoundError';
import path from "node:path";
import fs from 'fs';
import { readCached, writeCached } from './cache';

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

interface ProcessedDataCached<ProcessedDataResponse> {
  data: ProcessedDataResponse;
  cachedVersion: string;
}

interface FileMetaData<ProcessedDataResponse> {
	data: ProcessedDataResponse,
  cachedVersion?: string;
	cached: boolean,
  version: string
}

export const processFileOnHttp = async <ProcessedDataResponse>(
	{ fileUrl, version, processFile }: {
	fileUrl: string, 
  version: string,
	processFile: (mountedFilePath: string) => Promise<ProcessedDataResponse>
}): Promise<FileMetaData<ProcessedDataResponse>> => {
  const gotStream = got.stream.get(fileUrl);
  const tmpFileBasename = uuid() + '-' + path.basename(new URL(fileUrl).pathname);
  const outStream = fs.createWriteStream('/tmp/' + tmpFileBasename);

  console.info(
    'Attempting download from',
    fileUrl,
    'to /tmp/' + tmpFileBasename
  );

  try {
    await pipeline(gotStream, outStream) 
    console.info('Downloaded file', outStream.path)
    try {
      const data = await processFile(path.normalize(outStream.path as string));
      return { data, cached: false, version};
    } catch (error) {
      console.error(`Error computing: ${(error as Error).message}`)
      throw error;
    }
  } catch (error) {
    console.error('Error downloading file', error)
    throw error;
  } finally {
    fs.rmSync(outStream.path);
  }
}

// relativeCacheFolderPath: ".cache/loudness/"
// cacheFileExtension: ".loudness.json"
export const processFileOnShareOrHttp = async <ProcessedDataResponse>(
	{ shares, fileUrl, relativeCacheFolderPath, cacheFileExtension, lockfile, ignoreCache, version, processFile }: {
	shares: ShareInfo[], 
	fileUrl: string, 
	relativeCacheFolderPath: string, 
	cacheFileExtension: string, 
	lockfile: string, 
	ignoreCache: boolean,
  version: string,
	processFile: (mountedFilePath: string) => Promise<ProcessedDataResponse>
}): Promise<FileMetaData<ProcessedDataResponse>> => {
  try {
    const match = findPathInShares(fileUrl, shares)
    console.info('-> match found', match)
    console.info('Mounted file path', match.filePath)
    console.log('Analysing file', match.filePath)

    const cacheDir = path.join(path.dirname(match.filePath), relativeCacheFolderPath)

    const cacheFilePath = path.join(
      cacheDir,
      `${path.basename(match.filePath)}${cacheFileExtension}`
    )

    const lockFilePath = path.join(cacheDir, lockfile);

    if (match.share.cached) {
      // check if there is already a job running for this file
      if (fs.existsSync(lockFilePath)) {
        console.info('Job is already running for this file');

        // wait for the lock file to be removed
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (!fs.existsSync(lockFilePath)) {
              clearInterval(interval);
              resolve();
            } else {
              // delete the lock file if it is older than 30 minutes
              const lockFileStats = fs.statSync(lockFilePath);
              const now = new Date();
              const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

              if (lockFileStats.mtimeMs < thirtyMinutesAgo.getTime()) {
                console.info('Lock file is older than 30 minutes, deleting');
                fs.rmSync(lockFilePath);
                clearInterval(interval);
                resolve();
              }
              // console.info('Waiting for lock file to be removed')
            }
          }, 1000);
        });
      }

      // check if data is cached on drive
      if (fs.existsSync(cacheFilePath) && !ignoreCache) {
        try {
          // check if json file is newer than the file itself
          const mountedFileStats = fs.statSync(match.filePath)
          const jsonFileStats = fs.statSync(cacheFilePath)

          if (jsonFileStats.mtimeMs < mountedFileStats.mtimeMs) {
            console.info("Cached file is older than file, ignoring");
          } else {
            console.info('Serving cached result from file', cacheFilePath)
            const data = readCached<ProcessedDataCached<ProcessedDataResponse>>(cacheFilePath)

            return {
              ...data,
              cached: true,
              version
            }
          }
        } catch (error) {
          if( (error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.info('Cached file not found: ' + cacheFilePath)
          } else {
            throw error;
          }
        }
      } 
    }
    
    try {
      const data = await processFile(match.filePath);
      if (match.share.cached) {
        // create cache folder if it doesn't exist
        try {
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true })
          }
          // create lock file
          fs.writeFileSync(lockFilePath, '');
        } catch (error) {
          console.error('Error creating cache folder', error)
          throw error
        }
        // save the result to file
        try {
          writeCached<ProcessedDataCached<ProcessedDataResponse>>(cacheFilePath, {data, cachedVersion: version})
        } catch (error) {
          console.error("Error writing file", error)
        }
      }
      
      return { data, cached: false, version };
    } catch (error) {
      console.error(`Error computing: ${(error as Error).message}`)
      throw (error);
    } finally {
      if (fs.existsSync(lockFilePath)) {
        fs.rmSync(lockFilePath);
      }
    }
  } catch (error) {
    console.info((error as Error).message)
  }

	if (fileUrl.startsWith('http')) {
    try {
      return  processFileOnHttp<ProcessedDataResponse>({ fileUrl, version, processFile });
    } catch (error) {
      console.error('Error downloading file', error)
    } 
	}

	// if we get here, no match was found for the file in any of the shares
	console.log('File was not found: ' + fileUrl);
	throw(new FileNotFoundError('File was not found: ' + fileUrl));
}
