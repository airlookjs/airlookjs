import { type MediaInfo, OutputFormats, OutputFormatKeys, getMediainfo, mediainfoVersion } from './mediainfo.js'
import { processFileOnShareOrDownload, FileNotFoundError, ShareInfo } from '@airlookjs/shared';
import createError from 'http-errors'
import type { FastifyPluginCallback } from 'fastify';


import { VERSION } from './config.js'

export interface MediaInfoHandlerJsonResponse {
	cached?: boolean,
	version: string,
	mediainfo: MediaInfo
}

interface MediainfoDataCached {
  mediainfo: MediaInfo;
  cachedVersion: string;
}

export interface MediainfoDataResponse extends Omit<MediainfoDataCached, 'cachedVersion'> {
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
    Reply: IReply}>('/mediainfo', {
      preValidation: (req, _res, done) => {
        console.log('preValidation')
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
      const result = await processFileOnShareOrDownload<MediaInfo | string>({
        version: VERSION,
        shares: options.shares,
        fileUrl: file,
        relativeCacheFolderPath: options.cacheDir,
        cacheFileExtension: '.mediainfo.json',
        lockfile: 'mediainfo.lock',
        ignoreCache: !outputFormatMatchesDefault,
        processFile: async (file) => getMediainfo(file, outputFormat)
      })

      const outMixin = {
        version: VERSION,
        cached: result.cached,
      }

      if (OutputFormats[outputFormat][1] == 'JSON') {
				res.code(200).send({
          mediainfo: result.data,
           ...outMixin})

			} else if (OutputFormats[outputFormat][1] == 'XML') {
					res.type('text/xml').code(200)
												.send(result.data)
			} else {
				res.code(200).send({...result.data, ...outMixin})
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
