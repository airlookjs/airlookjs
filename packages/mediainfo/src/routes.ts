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
  Mediainfo: MediaInfo;
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
  200: MediainfoDataResponse;
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

      const { file, outputFormat=config.defaultOutputFormat } = req.query

		const outputFormatParam = req.query.outputFormat ?? options.defaultOutputFormatName;

    console.info('Using outputFormat', outputFormat);

    const outputFormatMatchesDefault = outputFormat == config.defaultOutputFormatName;

		processFileOnShareOrDownload<MediaInfo | string>({
      version: VERSION,
			shares: options.shares,
			fileUrl: file,
			relativeCacheFolderPath: '.cache/mediainfo/',
			cacheFileExtension: '.mediainfo.json',
			lockfile: 'mediainfo.lock',
			ignoreCache: !outputFormatMatchesDefault,
			processFile: (file) => getMediainfo(file, outputFormat)
		}).then(({ data, cached }) => {
			if (OutputFormats[outputFormat][1] == 'JSON') {
				res.code(200).send({
					mediainfo: data,
					version: VERSION,
					...(cached && { cached })
				})
			} else if (OutputFormats[outputFormat][1] == 'XML') {
												res.type('text/xml').code(200)
												.send(data)
			} else {
				res.code(200).send(data)
			}
		}).catch((error: Error) => {
			if (error instanceof FileNotFoundError) {
				throw createError(404, `File not found: ${file}`)
			} else {
				throw error
			}
		})
})

done()
}
