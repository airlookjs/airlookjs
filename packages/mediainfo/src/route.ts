/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import createError from 'http-errors'
import {stringIsAValidUrl} from './validateUrl.js'
import { type RequestHandler } from 'express'
import path from 'path'
import fs from 'fs'
import { OutputFormats, OutputFormatKeys, getMediainfo } from './cmd.js'

import { config } from './config.js'

// FIXME: rewrite as not a promise or use a plugin, errors are not handled correctly when using async/await for a request handler in express
// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const MediaInfoHandler : RequestHandler = async (req, res, next) => {
	console.log('Processing request', req.url, '->', req.params.path)

	let foundMatchingMountedFile = false
	const pathParam = req.params.path

    const outputFormatParam = req.query.outputFormat ?? config.defaultOutputFormatName;
	
    if(typeof outputFormatParam !== 'string' || !(outputFormatParam in OutputFormats)){
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        return next(createError(400, `Invalid outputFormat: ${outputFormatParam}`))
    }
    const outputFormat = outputFormatParam as OutputFormatKeys
	console.info('Using outputFormat', outputFormat)

	if (pathParam) {
		// check if file is matched by a share and if so, run the mediainfo analysis
		if(config.shares) {
		for (const share of config.shares) {
			console.info('Checking share', share.name, 'for matches')
			for (const match of share.matches) {
				console.info('Checking match', match, 'for', pathParam)
				const matchResult = pathParam.match(match)
				if (matchResult?.[1]) {
					console.info('-> match found', matchResult[1])
					const mountedFilePath = path.join(share.mount, matchResult[1])
					if (fs.existsSync(mountedFilePath)) {
						console.log('Analysing file', mountedFilePath)
						foundMatchingMountedFile = true

						const jsonFolderPath = path.join(path.dirname(mountedFilePath), '.cache/mediainfo/')

						const jsonFilePath = path.join(
							jsonFolderPath,
							path.basename(mountedFilePath) + '.mediainfo.json'
						)

						let sentCachedResult = false
						if (share.cached && outputFormat == config.defaultOutputFormatName) {
							// check if mediainfo data is cached on drive
							if (fs.existsSync(jsonFilePath)) {
								try {
									// check if json file is newer than the file itself
									const mountedFileStats = await fs.promises.stat(mountedFilePath)
									const jsonFileStats = await fs.promises.stat(jsonFilePath)

									if (jsonFileStats.mtimeMs < mountedFileStats.mtimeMs) {
										console.info('Cached mediainfo file is older than file, ignoring')
									} else {
										console.info('Serving cached result from file', jsonFilePath)
										const fileData = await fs.promises.readFile(jsonFilePath)
										const jsonData = JSON.parse(fileData.toString())
										jsonData.cached = true
										// TODO: check version matches jsonData.version = config.version
										res.json(jsonData)
										sentCachedResult = true
									}
								} catch (err) {
									if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
										console.info('Cached mediainfo file not found: ' + jsonFilePath)
									} else {
										next(err)
									}
								}
							}
						}

						if (!sentCachedResult) {
							const data = await getMediainfo(mountedFilePath, outputFormat).catch((err) => {
                                console.error('Error computing mediainfo: ' + err)
                                return next(err)
                            })

							if (share.cached && outputFormat == config.defaultOutputFormatName) {
                                // create cache folder if it doesn't exist
                                try {
                                    if (!fs.existsSync(jsonFolderPath)) {
                                        fs.mkdirSync(jsonFolderPath, { recursive: true })
                                    }
                                } catch (err) {
                                    console.error('Error creating cache folder', err)
                                    return next(err)
                                }
                                // save the result to file
                                try {
                                    await fs.promises.writeFile(jsonFilePath, JSON.stringify(data))
                                } catch (err) {
                                    console.error('Error writing mediainfo file', err)
                                }
							}
							if (OutputFormats[outputFormat][1] == 'JSON') {
								res.json({mediainfo: data, version: config.version})
							} else if (OutputFormats[outputFormat][1] == 'XML') {
                                res.set('Content-Type', 'text/xml')
                                res.send(data)
							} else {
								res.send(data)
							}
							
						}
					} else {
						console.info('File not found: ' + mountedFilePath)
					}
				} else {
					console.info('-> not matching')
				}
			}
			if (foundMatchingMountedFile) return
		}
		}

		if (!foundMatchingMountedFile && pathParam.startsWith('http')) {
			// Media file is not mounted, attempt using URL

			try {
				if (stringIsAValidUrl(pathParam, ['http', 'https'])) {
					const data = await getMediainfo(pathParam, outputFormat).catch((err) => {
                        console.error('Error computing mediainfo: ' + err)
                        return next(err)
                    })

                    console.info('Sending result')
                    foundMatchingMountedFile = true
                    if (OutputFormats[outputFormat][1] == 'JSON') {
                        res.json({mediainfo: data, version: config.version})
                    } else if (OutputFormats[outputFormat][1] == 'XML') {
                        res.set('Content-Type', 'text/xml')
                        res.send(data)
                    } else {
                        res.send(data)
                    }
				}

			} catch (error) {
				console.error(error)
				next(error)
			}
		}

		// if we get here, no match was found for the file in any of the shares
		if (!foundMatchingMountedFile) {
			console.log('File was not found: ' + pathParam)
			next(new Error('File was not found: ' + pathParam))
		}
	} else {
		console.log('Missing file argument')
		res.status(400)
		res.json({ error: 'Missing file argument' })
	}
}