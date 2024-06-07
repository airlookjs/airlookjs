import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import got from 'got';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { FileNotFoundError } from '../FileNotFoundError';
import { ShareInfo, findPathInShares } from '../shares';
import { readCached, writeCached } from '../cache';
import { FastifyInstance, FastifyPluginCallback, fastify } from 'fastify';

interface IBaseQueryString {
  file: string;
}

interface ProcessDataCached<T> {
  data: T;
  cachedVersion: string;
}

export interface ProcessDataResponse<T> extends Omit<ProcessDataCached<T>, 'cachedVersion'> {
  cached: boolean;
  version: string;
  cachedVersion?: string;
}

interface IProcessFileReply<T> {
  200: ProcessDataResponse<T>;
}
  export const getProcessFileRoute = <IQuery extends IBaseQueryString, IProcessResponse>(fastify: FastifyInstance, path: string, options: ) => {

      fastify.get<{Querystring: IQuery
      Reply: IProcessFileReply<IProcessResponse>}>
      (path, {
        preValidation: (req, _res, done) => {
          console.log('preValidation')
          if (!req.query.file) {
            throw createError(400, 'File parameter is required')
          }
          done()
        },
        /*onResponse: (_req, _res, done) => {
          // delete files in unlinkQueue and remove from unlinkQueue pop, warn on error
          while (unlinkQueue.length > 0) {
            const file = unlinkQueue.pop()
            if (file) {
              try {
                fs.rmSync(file)
              } catch (err) {
                console.warn('Error deleting file', file, err)
              }
            }
          }
          done()
        }*/
      }, async (req, res) => {

        const { file } = req.query

        try {
          const match = findPathInShares(fileUrl, shares)

          const cacheDir = path.join(path.dirname(match.filePath), relativeCacheFolderPath)
          const cacheFilePath = path.join(
                cacheDir,
                `path.basename(match.filePath)${cacheFileExtension}`
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

              }
              throw(new FileNotFoundError('File was not found: ' + fileUrl));
      }




    }
  }




    try {
      const match = findPathInShares(file, options.shares)

      const cacheDir = path.join(path.dirname(match.filePath), options.cacheDir)
      const cacheFilePath = path.join(
        cacheDir,
        `path.basename(match.filePath)${CACHE_FILE_EXTENSION}`
      )

      if (match.share.cached) {
        // check if cache dir exists, if not create it
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true })
        }

        if (fs.existsSync(cacheFilePath)) {
            // check if json file is newer than the file itself
            const fileStats = fs.statSync(match.filePath)
            const cacheFileStats = fs.statSync(cacheFilePath)
            if (cacheFileStats.mtimeMs < fileStats.mtimeMs) {
              console.info("Cached loudness file is older than file, ignoring");
              // TODO: we should probably delete the cache file here

            } else {
              const cachedData = readCached<LoudnessDataCached>(cacheFilePath)

              // data format is compatible across all versions currently, we can add a check for a semver range here later if nessessary
              /*if(cachedData.version !== VERSION) {
                console.warn("Cached loudness file is outdated");
              } else {
              }*/

              return reply.code(200).send({
                ...cachedData,
                version: VERSION,
                cached: true,
              })
            }
        }
      }

      const data = await getLoudness(match.filePath, sampleRate)
      if (match.share.cached) {
        writeCached<LoudnessDataCached>(cacheFilePath, {...data, cachedVersion: VERSION})
      }

      return reply.code(200).send({
        ...data,
        version: VERSION,
        cached: false,
      })

    } catch (error) {

      console.warn('Error getting loudness from shares', error)
      // fall back to url download
      if(file.startsWith('http')) {
        const gotStream = got.stream.get(file);
        const tmpFileBasename = uuid() + '-' + path.basename(new URL(file).pathname);
        const outStream = fs.createWriteStream('/tmp/' + tmpFileBasename);

        console.info(
          'File is not mounted, attempt download from',
          file,
          'to /tmp/' + tmpFileBasename
        );

        await pipeline(gotStream, outStream)
        const data = await getLoudness(path.normalize(outStream.path as string), sampleRate)

        unlinkQueue.push(outStream.path as string)

        return reply.code(200).send({
          ...data,
          version: VERSION,
          cached: false,
        })

      }

      throw createError(404, 'File not found on any shares or as URL')

    }
})

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
