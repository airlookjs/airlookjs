import fs from 'fs';
import { pipeline } from 'node:stream/promises';
import got from 'got';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { FileNotFoundError } from './FileNotFoundError.js';
import { ShareInfo, findPathInShares } from './shares.js';
import { readCached, writeCached } from './cache.js';

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

// parse floats from env safely
export const parseFloatEnv = (env: string | undefined, defaultValue: number) : number => {
  if (env === undefined) {
    return defaultValue;
  }
  const parsed = parseFloat(env);
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


// relativeCacheFolderPath: ".cache/loudness/"
// cacheFileExtension: ".loudness.json"
export const processFileOnShareOrDownload = async <ProcessedDataResponse>(
	{ shares, fileUrl, relativeCacheFolderPath, cacheFileExtension, lockfile, ignoreCache, version, processFile }: {
	shares: ShareInfo[],
	fileUrl: string,
	relativeCacheFolderPath: string,
	cacheFileExtension: string,
	lockfile: string,
	ignoreCache: boolean,
  version: string,
	processFile: (file: string) => Promise<ProcessedDataResponse>
}): Promise<FileMetaData<ProcessedDataResponse>> => {
	// check if file is matched by a share and if so, run the loudness analysis
	// the for ... const .. of syntax works for async
  try {
    const match = findPathInShares(fileUrl, shares)
    const cacheDir = path.join(path.dirname(match.filePath), relativeCacheFolderPath)

    const cacheFilePath = path.join(
          cacheDir,
          `${path.basename(match.filePath)}${cacheFileExtension}`
        )
    const lockFilePath = path.join(cacheDir, lockfile);


	  if (match.share.cached) {
      // check if cache dir exists, if not create it
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true })
      }
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
          const fileStats = fs.statSync(match.filePath)
          const cacheFileStats = fs.statSync(cacheFilePath)

          if (cacheFileStats.mtimeMs < fileStats.mtimeMs) {
            console.info("Cached loudness file is older than file, ignoring");
            // TODO: we should probably delete the cache file here

          } else {
            const data = readCached<ProcessedDataCached<ProcessedDataResponse>>(cacheFilePath)

          // data format is compatible across all versions currently, we can add a check for a semver range here later if nessessary
          /*if(cachedData.version !== VERSION) {
            console.warn("Cached loudness file is outdated");
          } else {
          }*/
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
        try {
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

          console.error('Error getting loudness from shares falling back to uri', error);

  }


  if (fileUrl.startsWith('http')) {
    const gotStream = got.stream.get(fileUrl);
    const tmpFileBasename = uuid() + '-' + path.basename(new URL(fileUrl).pathname);
    const outStream = fs.createWriteStream('/tmp/' + tmpFileBasename);

    console.info(
              'File is not mounted, attempt download from',
              fileUrl,
              'to /tmp/' + tmpFileBasename
    );
            try {
              await pipeline(gotStream, outStream)
              console.info('Downloaded file', outStream.path)

              try {
                const data = await processFile(path.normalize(outStream.path as string));

                //TODO: unlinkQueue.push(outStream.path as string)
                return { data, cached: false, version};

              } catch (error) {
                console.error(`Error computing: ${(error as Error).message}`)
                throw error;
              }
            } catch (error) {
              console.error('Error downloading file', error)
              throw error;
            } finally {
              fs.rmSync(outStream.path); // TODO: unlink in onResponse handler instead
            }
          }

        throw(new FileNotFoundError('File was not found: ' + fileUrl));
}

