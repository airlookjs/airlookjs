import { type LoudnessData, getLoudness, loudnessVersion, LoudnessOutput } from './loudness.js';
import { ShareInfo, processFileOnShareOrHttp } from '@airlookjs/shared';
import fs from 'node:fs';
import createError from 'http-errors'
import type { FastifyPluginCallback } from 'fastify';
import { VERSION } from './config.js';
interface LoudnessDataCached {
  loudness: LoudnessData;
  cachedVersion: string;
}
export interface LoudnessDataResponse extends Omit<LoudnessDataCached, 'cachedVersion'> {
  cached: boolean;
  version: string;
  cachedVersion?: string;
}

interface IQuerystring {
  file: string;
  sampleRate?: number;
}
interface IReply {
  200: LoudnessDataResponse;
}

export interface LoudnessRoutesOptions {
  prefix: string;
  shares: ShareInfo[];
  defaultSampleRate: number;
  cacheDir: string;
}

const CACHE_FILE_EXTENSION = ".loudness.json"
const LOCK_FILE_EXTENSION = ".loudness.lock"

export const routes: FastifyPluginCallback<LoudnessRoutesOptions> = (fastify, options, done) => {

  const unlinkQueue : string[] = [];

  fastify.get('/', async (_req, res) => {
      const v = await loudnessVersion();
      return res.code(200).send({ message: 'Loudness scanner is running',
          v,
          version: VERSION
      });
  })

  fastify.get<{Querystring: IQuerystring,
    Reply: IReply}>('/loudness', {
      preValidation: (req, _res, done) => {
        if (!req.query.file) {
          throw createError(400, 'File parameter is required')
        }
        done()
      },
      onResponse: (_req, _res, done) => {
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
      }
  }, async (request, response) => {

      const { file, sampleRate=options.defaultSampleRate } = request.query

      const result = await processFileOnShareOrHttp<LoudnessOutput>({
        shares: options.shares,
        fileUrl: file,
        relativeCacheFolderPath: options.cacheDir,
        cacheFileExtension: CACHE_FILE_EXTENSION,
        lockFileExtension: LOCK_FILE_EXTENSION,
        ignoreCache: false,
        version: VERSION,
        processFile: async({ file }) => getLoudness({ file, sampleRate })
      })

      return response.code(200).send({
        ...result.data,
        version: VERSION,
        cached: result.cached,
        ...(result.cached && { cachedVersion: result.cachedVersion })
      })


  })

  done()
}
