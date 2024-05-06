import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import got from 'got';
import path from 'path';
import { type RequestHandler, type ErrorRequestHandler } from 'express';
import { v4 as uuid } from 'uuid';
import { getScenes } from './scenedetect.js';
import { config } from './config.js';

export const loudnessRequestHandler: RequestHandler = async (req, res, next) => {
	console.log('Processing request', req.url, '->', req.query.file);
	// the query parameter might be other data types than string, if so throw error
	if (typeof req.query.file !== 'string') {
		throw new Error('query parameter file cannot be an array');
	}

	const fileUrl: string = req.query.file;

	let error: string | null = null;

	let foundMatchingMountedFile = false;

	if (fileUrl) {
		// check if file is matched by a share and if so, run the scene analysis
		for (const share of config.shares) {
			console.info('Checking share', share.name, 'for matches');
			for (const match of share.matches) {
				console.info('Checking match', match, 'for', fileUrl);
				const matchResult = fileUrl.match(match);
				if (matchResult && matchResult[1]) {
					console.info('-> match found', matchResult[1]);
					const mountedFilePath = path.join(share.mount, matchResult[1]);
					if (fs.existsSync(mountedFilePath)) {
						console.log('Analysing file', mountedFilePath);
						foundMatchingMountedFile = true;

						// TODO: make sure to use a seperate cache folder for each file

						const jsonFolderPath = path.join(
							path.dirname(mountedFilePath),
							'.cache/scenedetect/',
							path.basename(mountedFilePath) + '/'
						);

						const jsonFilePath = path.join(jsonFolderPath, 'scenedetect.json');
						const lockFilePath = path.join(jsonFolderPath, 'scenedetect.lock');

						let sentCachedResult = false;

						if (share.cached) {
							// check if there is already a job running for this file
							if (fs.existsSync(lockFilePath)) {
								console.info('Scenedetect job is already running for this file');

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

							// check if scenedetect data is cached on drive
							if (fs.existsSync(jsonFilePath)) {
								try {
									// check if json file is newer than the file itself
									const mountedFileStats = await fs.promises.stat(mountedFilePath);
									const jsonFileStats = await fs.promises.stat(jsonFilePath);

									if (jsonFileStats.mtimeMs < mountedFileStats.mtimeMs) {
										console.info('Cached scenedetect file is older than file, ignoring');
										// delete the cached file
										// fs.rmSync(jsonFolderPath, { recursive: true, force: true })
									} else {
										console.info('Serving cached result from file', jsonFilePath);
										const fileData = await fs.promises.readFile(jsonFilePath);
										const jsonData = JSON.parse(fileData.toString());
										jsonData.cached = true;
										jsonData.version = config.version;
										res.json(jsonData);
										sentCachedResult = true;
									}
								} catch (err) {
									if (err.code === 'ENOENT') {
										console.info('Cached scenedetect file not found: ' + jsonFilePath);
									} else {
										next(err);
									}
								}
							}
						}

						if (!sentCachedResult) {
							if (share.cached) {
								// create cache folder if it doesn't exist
								try {
									if (!fs.existsSync(jsonFolderPath)) {
										fs.mkdirSync(jsonFolderPath, { recursive: true });
									}
									// create lock file
									fs.writeFileSync(lockFilePath, '');
								} catch (err) {
									console.error('Error creating cache folder', err);
									next(err);
								}
							}
							const data = await getScenes(mountedFilePath, jsonFolderPath);
							if (data.error) {
								console.error('Error detecting scenes: ' + data.error);
								error = data.error;
								next(data.error);
							} else {
								if (share.cached) {
									// save the result to file
									try {
										await fs.promises.writeFile(jsonFilePath, JSON.stringify(data));
									} catch (err) {
										console.error('Error writing scenedetect file', err);
									}
								}
								res.json({
									...data,
									version: config.version
								});
							}
							// remove the lock file
							fs.rmSync(lockFilePath);
						}
					} else {
						console.info('File not found: ' + mountedFilePath);
					}
				} else {
					console.info('-> not matching');
				}
			}
			if (foundMatchingMountedFile) return;
		}

		if (!foundMatchingMountedFile && fileUrl.indexOf('http') === 0) {
			const gotStream = got.stream.get(fileUrl);
			const tmpFileBasename = uuid() + '-' + path.basename(new URL(fileUrl).pathname);
			const outStream = fs.createWriteStream('/tmp/' + tmpFileBasename);
			console.info(
				'File is not mounted, attempt download from',
				fileUrl,
				'to /tmp/' + tmpFileBasename
			);

			try {
				await pipeline(gotStream, outStream);
				console.info('Downloaded file', outStream.path);
				// it's safe to pass file.path as string as the file.path will be the same type as the createWriteStream was called with.
				const data = await getScenes(path.normalize(outStream.path as string));
				if (data.error) {
					console.error('Error detecting scenes: ' + data.error);
					error = data.error;
					next(data.error);
				} else {
					console.info('Sending result');
					foundMatchingMountedFile = true;
					res.json({
						...data,
						version: config.version
					});
				}
				fs.rmSync(outStream.path);
			} catch (error) {
				console.error(error);
				next(error);
			}
		}

		// if we get here, no match was found for the file in any of the shares
		if (!foundMatchingMountedFile && error === null) {
			console.log('File was not found: ' + fileUrl);
			next(new Error('File was not found: ' + fileUrl));
		}
	} else {
		console.log('Missing file argument');
		res.status(400);
		res.json({ error: 'Missing file argument' });
	}
};

export const errorRequestHandler: ErrorRequestHandler = (err, _req, res) => {
	// The error id is attached to `res.sentry` to be returned
	// and optionally displayed to the user for support.
	res.statusCode = 500;
	res.json({ error: err.message });
	//res.end(err + "\n" + "Report this Sentry ID to the developers: " + res.sentry + '\n');
};
