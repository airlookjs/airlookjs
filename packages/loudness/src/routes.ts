import { type LoudnessData, getLoudness, loudnessVersion } from './loudness.js';
import { ShareInfo, findPathInShares, readCached, writeCached } from '@airlookjs/shared';

import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuid } from 'uuid';
import got from 'got';
import { pipeline } from 'stream/promises';
import createError from 'http-errors'
import { FastifyPluginAsync } from 'fastify';
import { VERSION } from './config.js';

interface LoudnessDataCached {
  loudness: LoudnessData;
  cachedVersion: string;
}

interface LoudnessDataResponse extends Omit<LoudnessDataCached, 'cachedVersion'> {
  cached: boolean;
  version: string;
  cachedVersion?: string;
}

interface IQuerystring {
  file: string;
  sampleRate?: number;
}

interface IParams {
}

interface IHeaders {
}

interface IReply {
  200: LoudnessDataResponse;
}

export interface LoudnessRoutesOptions {
  prefix: string;
  shares: ShareInfo[];
  sampleRate: number;
  cacheDir: string;
}

const CACHE_FILE_EXTENSION = ".loudness.json"

export const routes: FastifyPluginAsync<LoudnessRoutesOptions> = async (fastify, options) => {

  const unlinkQueue : string[] = [];

  fastify.get<{}>('/', async (req, res) => {
      const v = await loudnessVersion();
      return res.code(200).send({ message: 'Loudness scanner is running',
          v,
          version: VERSION
      });
  })

  fastify.get<{Querystring: IQuerystring,
    Params: IParams,
    Headers: IHeaders,
    Reply: IReply}>('/loudness', {
      preValidation: async (request) => {
        console.log('preValidation')
        if (!request.query.file) {

          throw createError(400, 'File parameter is required')
        }
      },
      onResponse: async () => {
        // delete files in unlinkQueue and remove from unlinkQueue pop, warn on error
        while (unlinkQueue.length > 0) {
          const file = unlinkQueue.pop()
          if (file) {
            fs.unlink(file, (err) => {
              if (err) {
                console.warn('Error deleting file', file, err)
              }
            })
          }
        }
      }
  }, async (request, reply) => {

      const { file, sampleRate=options.sampleRate } = request.query

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
}
