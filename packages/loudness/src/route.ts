
import fs from 'fs';
import createError from 'http-errors'
import { pipeline } from 'stream/promises';
import got from 'got';
import path from 'path';
import { type RequestHandler, type ErrorRequestHandler } from 'express';
import { v4 as uuid } from 'uuid';
import { type LoudnessData, getLoudness } from './loudness.js';
import { config } from './config.js'

interface LoudnessDataFile {
  loudness: LoudnessData;
}

// in express v5 the RequestHandler may be async and we can remove this eslint-disable
// wrapping the awaits in a try catch block is necessary to avoid express hanging on errors for now
export const loudnessRequestHandler: RequestHandler = (req, res, next) => {
  
    console.log('Processing request', req.url, '->', req.query.file)
    // the query parameter might be other data types than string, if so throw error
    if (typeof req.query.file !== 'string') {
      return next(createError.BadRequest('Invalid query parameter file must be a string'));
    }
    
    const fileUrl: string = req.query.file;
    const querySampleRate = req.query.sampleRate;

    // the query parameter might be other data types than string, if so throw error
    if (querySampleRate) {
      if (typeof querySampleRate !== 'string' || isNaN(Number(querySampleRate))) {
        return next(createError.BadRequest('Invalid query parameter sampleRate'));
      }
    }

    const sampleRate = Number(querySampleRate) || 0.02; 
    let foundMatchingMountedFile = false

    // check if file is matched by a share and if so, run the loudness analysis
    // the for ... const .. of syntax works for async
    for (const share of config.shares) {
      console.info('Checking share', share.name, 'for matches')
      for (const match of share.matches) {
        console.info('Checking match', match, 'for', fileUrl)
        const matchResult = fileUrl.match(match)
        if (matchResult?.[1]) {
          console.info('-> match found', matchResult[1])
          const mountedFilePath = path.join(share.mount, matchResult[1])
          console.info('Mounted file path', mountedFilePath)
          console.log(import.meta.dirname)
          if (fs.existsSync(mountedFilePath)) {
            console.log('Analysing file', mountedFilePath)
            foundMatchingMountedFile = true

            const jsonFolderPath = path.join(path.dirname(mountedFilePath), ".cache/loudness/")

            const jsonFilePath = path.join(
              jsonFolderPath,
              path.basename(mountedFilePath) + ".loudness.json"
            )

            let sentCachedResult = false

            if (share.cached) {
              // check if data is cached on drive
              if (fs.existsSync(jsonFilePath)) {
                try {
                  // check if json file is newer than the file itself
                  const mountedFileStats = fs.statSync(mountedFilePath)
                  const jsonFileStats = fs.statSync(jsonFilePath)

                  if (jsonFileStats.mtimeMs < mountedFileStats.mtimeMs) {
                    console.info("Cached loudness file is older than file, ignoring");
                  } else {
                    console.info('Serving cached result from file', jsonFilePath)
                    const fileData = fs.readFileSync(jsonFilePath)
                    const jsonData = {
                      ...(JSON.parse(fileData.toString()) as LoudnessDataFile),
                      cached: true,
                      version: config.version
                    }
                    res.json(jsonData);
                    sentCachedResult = true
                  }
                } catch (e) {
                  if( (e as NodeJS.ErrnoException).code === 'ENOENT') {
                    console.info('Cached loudness file not found: ' + jsonFilePath)
                  } else {
                    return next(e);
                  }
                }
              }
            }

            if (!sentCachedResult) {
                getLoudness(mountedFilePath, sampleRate).then((data) => {

                if (share.cached) {
                  // create cache folder if it doesn't exist
                  try {
                    if (!fs.existsSync(jsonFolderPath)) {
                      fs.mkdirSync(jsonFolderPath, { recursive: true })
                    }
                  } catch (err) {
                    console.error('Error creating cache folder', err)
                    next(err)
                  }
                  // save the result to file
                  try {
                    fs.writeFileSync(jsonFilePath, JSON.stringify(data))
                  } catch (err) {
                    console.error("Error writing loudness file", err)
                  }
                }

                res.json({
                  ...data,
                  version: config.version
                })
              }).catch((err) => {
                console.error(`Error computing loudness: ${(err as Error).message}`)
                next(err)
              })
          } else {
            console.info('File not found: ' + mountedFilePath)
          }
        } else {
          console.info('-> not matching')
        }
      };
      if (foundMatchingMountedFile) return
    }

    if (!foundMatchingMountedFile && fileUrl.startsWith('http')) {

      const gotStream = got.stream.get(fileUrl);
      const tmpFileBasename = uuid() + '-' + path.basename(new URL(fileUrl).pathname);
      const outStream = fs.createWriteStream('/tmp/' + tmpFileBasename);

      console.info(
        'File is not mounted, attempt download from',
        fileUrl,
        'to /tmp/' + tmpFileBasename
      );

      
        pipeline(gotStream, outStream).then(() => {
          console.info('Downloaded file', outStream.path)

          getLoudness(path.normalize(outStream.path as string), sampleRate).then((data) => {
            res.json({
              ...data,
              version: config.version
            })
          }).catch((err) => {
            console.error(`Error computing loudness: ${(err as Error).message}`)
            next(err)
          })

        }).catch((err) => {
          console.error('Error downloading file', err)
          return next(err)
        })

        
        fs.rmSync(outStream.path); //TODO: move to a handler that is always called after request is done
      
    }

    // if we get here, no match was found for the file in any of the shares
    /*if (!foundMatchingMountedFile && error === null) {
      console.log('File was not found: ' + fileUrl);
      next(new Error('File was not found: ' + fileUrl));
    }*/

}
}

export const errorRequestHandler: ErrorRequestHandler = (error, _req, res, next) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  if (res.headersSent) {
		return next(error);
	}
  console.error((error as Error).stack);

  res.status(error.statusCode).json({ error: (error as Error).message });
  //res.end(err + "\n" + "Report this Sentry ID to the developers: " + res.sentry + '\n');

  next();
}
