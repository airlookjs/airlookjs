import { type MediaInfo, OutputFormats, getMediainfo, mediainfoVersion, OutputFormatKeys } from './mediainfo.js'
import { FileNotFoundError, ShareInfo, processFileOnShareOrHttp } from '@airlookjs/shared';
import createError from 'http-errors'
import type { FastifyPluginCallback } from 'fastify';


import { VERSION } from './config.js'

export interface MediainfoDataResponse {
  mediainfo: MediaInfo;
  cached: boolean;
  version: string;
  cachedVersion?: string;
}

interface IQuerystring {
  file: string;
  outputFormat?: string;
}
interface IReply {
  200: MediainfoDataResponse | string;
}

export interface MediainfoRoutesOptions {
  prefix: string;
  shares: ShareInfo[];
  defaultOutputFormat: string;
  cacheDir: string;
}

export const routes: FastifyPluginCallback<MediainfoRoutesOptions> = (fastify, options, done) => {

  fastify.get('/', async (_req, res) => {
    const v = await mediainfoVersion();
    return res.code(200).send({ message: 'Mediainfo server is running',
        v,
        version: VERSION
    });
  })

  fastify.get<{Querystring: IQuerystring,
    Reply: IReply}>('/get', {
      preValidation: (req, _res, done) => {
        if (!req.query.file) {
          throw createError(400, 'File parameter is required')
        }
        done()
      },
      //onResponse:
    }, async (req, res) => {

    const { file, outputFormat=options.defaultOutputFormat } = req.query

    console.info('Using outputFormat', outputFormat);

    const outputFormatMatchesDefault = outputFormat == options.defaultOutputFormat;

    
    try {
      const result = await processFileOnShareOrHttp<MediaInfo | string>({
        version: VERSION,
        shares: options.shares,
        fileUrl: file,
        relativeCacheFolderPath: options.cacheDir,
        ignoreCache: !outputFormatMatchesDefault,
        canProcessFileOnHttp: true,
        processFile: async ({ file }) => getMediainfo({ file, outputFormatKey: outputFormat as OutputFormatKeys })
      })


      if (OutputFormats[outputFormat as OutputFormatKeys][1] == 'XML') {
					return res.type('text/xml').code(200)
												.send(result.data as string)
			} else {
        const { data, ...rest } = result;
				return res.code(200).send({
          mediainfo: data as MediaInfo, 
          ...rest
        })
			}

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
