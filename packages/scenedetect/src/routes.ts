import { getScenes, scenedetectVersion, type ScenesOutput } from './scenedetect.js'
import { FileNotFoundError, ShareInfo, processFileOnShareOrHttp } from '@airlookjs/shared';
import createError from 'http-errors'
import type { FastifyPluginCallback } from 'fastify';


import { VERSION } from './config.js'

export interface ScenedetectDataResponse extends ScenesOutput {
  cached: boolean;
  version: string;
  cachedVersion?: string;
}

interface IQuerystring {
  file: string;
  outputFormat?: string;
}

interface IReply {
  200: ScenedetectDataResponse;
}

export interface ScenedetectRoutesOptions {
  prefix: string;
  shares: ShareInfo[];
  cacheDir: string;
}

export const routes: FastifyPluginCallback<ScenedetectRoutesOptions> = (fastify, options, done) => {
  fastify.get('/', async (_req, res) => {
    const v = await scenedetectVersion();
    return res.code(200).send({ message: 'SceneDetect server is running',
        v,
        version: VERSION
    });
  })

  fastify.get<{Querystring: IQuerystring,
    Reply: IReply}>('/get', {
      preValidation: (req, _res, done) => {
        console.log('preValidation')
        if (!req.query.file) {
          throw createError(400, 'File parameter is required')
        }
        done()
      },
      //onResponse:
    }, async (request, response) => {

    const { file } = request.query

    try {
      console.log("SCENEDETECT ROUTES")
      console.log(VERSION);

      const result = await processFileOnShareOrHttp<ScenesOutput>({
        version: VERSION,
        shares: options.shares,
        fileUrl: file,
        relativeCacheFolderPath: options.cacheDir,
        ignoreCache: false,
        processFile: async ({ file, cachePath }) => getScenes({ file, cachePath })
      })

      const { data, ...rest } = result;

      return response.code(200).send({
        ...result.data,
        ...rest,
      })
		} catch (error: unknown) {
      console.error('Error getting mediainfo', error)
			if (error instanceof FileNotFoundError) {
				throw createError(404, `File not found: ${file}`)
			} else {
				throw error
			}
		}
  })

  done()
}
