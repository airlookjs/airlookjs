/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import createError, { HttpError } from 'http-errors'
import { type RequestHandler, type ErrorRequestHandler } from 'express'
import { MediaInfo, OutputFormats, OutputFormatKeys, getMediainfo } from './cmd.js'
import { processFileOnShareOrHttp, FileNotFoundError } from '@airlookjs/shared';

import { config } from './config.js'

export interface MediaInfoHandlerJsonResponse {
	cached?: boolean,
	version: string,
	mediainfo: MediaInfo
}

// FIXME: rewrite as not a promise or use a plugin, errors are not handled correctly when using async/await for a request handler in express
// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const MediaInfoHandler : RequestHandler = (async (req, res, next) => {
		console.log('Processing request', req.url, '->', req.query.file)
	
		if (typeof req.query.file !== 'string') {
			return next(createError.BadRequest('Invalid query parameter file must be a string'));
		}
		
		const fileUrl: string = req.query.file;
	
		const outputFormatParam = req.query.outputFormat ?? config.defaultOutputFormatName;
		
		if(typeof outputFormatParam !== 'string' || !(outputFormatParam in OutputFormats)){
	        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
				return next(createError(400, `Invalid outputFormat: ${outputFormatParam}`))
		}
		const outputFormat = outputFormatParam as OutputFormatKeys
	
	console.info('Using outputFormat', outputFormat);

	const outputFormatMatchesDefault = outputFormat == config.defaultOutputFormatName;

	if (fileUrl) {
		processFileOnShareOrHttp<MediaInfo | string>({
			shares: config.shares, 
			fileUrl, 
			relativeCacheFolderPath: '.cache/mediainfo/', 
			cacheFileExtension: '.mediainfo.json', 
			lockfile: 'mediainfo.lock',
			isCacheUsed: outputFormatMatchesDefault,
			canProcessFileOnHttp: true,
			processFile: (file) => getMediainfo(file, outputFormat),
		}).then(({ data, cached }) => {
			if (OutputFormats[outputFormat][1] == 'JSON') {
				res.json({ 
					mediainfo: data, 
					version: config.version,
					...(cached && { cached })
				} as MediaInfoHandlerJsonResponse)
			} else if (OutputFormats[outputFormat][1] == 'XML') {
												res.set('Content-Type', 'text/xml')
												res.send(data)
			} else {
				res.send(data)
			}
		}).catch((error: Error) => {
			if (error instanceof FileNotFoundError) {
				return next(createError(404, `File not found: ${fileUrl}`))
			} else {
				next(error)
			}
		})
	} else {
		console.log('Missing file argument')
		res.status(400)
		res.json({ error: 'Missing file argument' })
	}
})

// TODO: write typesafe common error handler for all express apps
export const errorRequestHandler: ErrorRequestHandler = (error, _req, res, next) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  if (res.headersSent) {
		return next(error);
	}
  console.error((error as Error).stack);

  res.status((error as HttpError).statusCode).json({ error: (error as Error).message });
  //res.end(err + "\n" + "Report this Sentry ID to the developers: " + res.sentry + '\n');

  next();
}
