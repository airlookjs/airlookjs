import { v4 as uuid } from 'uuid';
import { FileNotFoundError } from './FileNotFoundError.js';
import { pipeline } from 'node:stream/promises';
import got from 'got';
import path from "node:path";
import fs from 'fs';
import { readCached, writeCached } from './cache.js';

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

export interface FileMetaData<ProcessedDataResponse> {
	data: ProcessedDataResponse,
  cachedVersion?: string;
	cached: boolean,
  version: string
}

const waitForAlreadyRunningJob = async (lockFilePath: string): Promise<void> => {
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
}

const processWithLockFile = async <T>(processFile: () => Promise<T>, lockFilePath: string, isLockable: boolean): Promise<T> => {
  try {
    if (isLockable) {
      try {
        // create lock file
        fs.writeFileSync(lockFilePath, '');
      } catch (error) {
        console.error('Error creating cache folder', error)
        throw error
      }
    }

    return await processFile()
  } finally {
    if (fs.existsSync(lockFilePath)) {
      fs.rmSync(lockFilePath);
    }
  }
}

export const processFileOnHttp = async <ProcessedDataResponse>(
	{ fileUrl, processFile }: {
	fileUrl: string, 
	processFile: ({ file }: { file: string }) => Promise<ProcessedDataResponse>
}): Promise<ProcessedDataResponse> => {
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
      return await processFile({ file: path.normalize(outStream.path as string)});
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
	{ shares, fileUrl, relativeCacheFolderPath, cacheFileExtension, lockFileExtension, ignoreCache, version, canProcessFileOnHttp = false, processFile }: {
	shares: ShareInfo[], 
	fileUrl: string, 
	relativeCacheFolderPath: string, 
	cacheFileExtension: string, 
	lockFileExtension: string, 
	ignoreCache: boolean,
  version: string,
  canProcessFileOnHttp?: boolean,
	processFile: ({ file, cachePath }: { file: string, cachePath?: string }) => Promise<ProcessedDataResponse>
}): Promise<FileMetaData<ProcessedDataResponse>> => {
  try {
    const match = findPathInShares(fileUrl, shares);

    const cacheDir = path.join(path.dirname(match.filePath), relativeCacheFolderPath)

    const fileName = path.basename(match.filePath);

    const cacheFilePath = path.join(
      cacheDir,
      `${fileName}${cacheFileExtension}`
    )

    const lockFilePath = path.join(cacheDir, `${fileName}${lockFileExtension}`);

    if (match.share.cached) {
      // check if cache dir exists, if not create it
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true })
      }

      await waitForAlreadyRunningJob(lockFilePath);

      // check if data is cached on drive
      if (fs.existsSync(cacheFilePath) && !ignoreCache) {
        try {
          // check if json file is newer than the file itself
          const fileStats = fs.statSync(match.filePath)
          const cacheFileStats = fs.statSync(cacheFilePath)

          if (cacheFileStats.mtimeMs < fileStats.mtimeMs) {
            console.info("Cached file is older than file, ignoring");
          } else {
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
      const data = await processWithLockFile<ProcessedDataResponse>(
        () => processFile({ file: match.filePath, ...(match.share.cached && !ignoreCache && { cachePath: cacheDir })}), 
        lockFilePath, 
        match.share.cached
      )

      if (match.share.cached) {
        // save the result to file
        try {
          writeCached<ProcessedDataCached<ProcessedDataResponse>>(cacheFilePath, {data, cachedVersion: version })
        } catch (error) {
          console.error("Error writing file", error)
        }
      }
      
      return { data, cached: false, version };
    } catch (error) {
      console.error(`Error computing: ${(error as Error).message}`)
      throw (error);
    } 
  } catch (error) {
    console.error((error as Error).message)
  }

	if (fileUrl.startsWith('http')) {
    if (canProcessFileOnHttp) {
      const data = await processFile({ file: fileUrl });
      return { data, cached: false, version };
    }

    try {
      const data = await processFileOnHttp<ProcessedDataResponse>({ fileUrl, processFile });
      
      return { data, cached: false, version  };
    } catch (error) {
      console.error((error as Error).message)
      throw error;
    }
	}

  // if we get here, no match was found for the file in any of the shares
  console.log('File was not found: ' + fileUrl);
  throw(new FileNotFoundError('File was not found: ' + fileUrl));
}
