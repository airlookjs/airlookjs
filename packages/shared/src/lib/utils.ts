import fs from 'fs';
import { pipeline } from 'node:stream/promises';
import got from 'got';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { FileNotFoundError } from './FileNotFoundError';

export interface ShareInfo {
	name: string;
	//localizedName: string; // TODO: seems to be unused unnecessary to include here
	mount: string;
	uncRoot: string;
	cached: boolean;
	systemRoot: string;
	matches: RegExp[];
}

// parse ints from env safely
export const parseIntEnv = (env:  string | undefined, defaultValue: number) : number => {
	if (env === undefined) {
		return defaultValue;
	}
	const parsed = parseInt(env);
	if (isNaN(parsed)) {
		return defaultValue;
	}
	return parsed;
};

// parse bools from env safely
export const parseBoolEnv = (env: string | undefined, defaultValue: boolean) : boolean => {
	if (env === undefined) {
		return defaultValue;
	}
	if (env === 'true') {
		return true;
	}
	if (env === 'false') {
		return false;
	}
	return defaultValue;
};

interface FileMetaData<ProcessedDataResponse> {
	data: ProcessedDataResponse,
	cached?: boolean,
}

// relativeCacheFolderPath: ".cache/loudness/"
// cacheFileExtension: ".loudness.json"
export const processFileOnShareOrDownload = async <ProcessedDataResponse>(
	{ shares, fileUrl, relativeCacheFolderPath, cacheFileExtension, lockfile, ignoreCache, processFile }: {
	shares: ShareInfo[], 
	fileUrl: string, 
	relativeCacheFolderPath: string, 
	cacheFileExtension: string, 
	lockfile: string, 
	ignoreCache: boolean,
	processFile: (mountedFilePath: string) => Promise<ProcessedDataResponse>
}): Promise<FileMetaData<ProcessedDataResponse>> => {
	// check if file is matched by a share and if so, run the loudness analysis
	// the for ... const .. of syntax works for async
	for (const share of shares) {
		console.info('Checking share', share.name, 'for matches')
		for (const match of share.matches) {
			console.info('Checking match', match, 'for', fileUrl)
			const matchResult = fileUrl.match(match)
			if (matchResult?.[1]) {
				console.info('-> match found', matchResult[1])
				const mountedFilePath = path.join(share.mount, matchResult[1])
				console.info('Mounted file path', mountedFilePath)
				if (fs.existsSync(mountedFilePath)) {
					console.log('Analysing file', mountedFilePath)

					const jsonFolderPath = path.join(path.dirname(mountedFilePath), relativeCacheFolderPath)

					const jsonFilePath = path.join(
						jsonFolderPath,
						path.basename(mountedFilePath) + cacheFileExtension
					)

					const lockFilePath = path.join(jsonFolderPath, lockfile);

					if (share.cached) {
						// check if there is already a job running for this file
						if (fs.existsSync(lockFilePath)) {
							console.info('Job is already running for this file');

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


						// check if data is cached on drive
						if (fs.existsSync(jsonFilePath) && !ignoreCache) {
							try {
								// check if json file is newer than the file itself
								const mountedFileStats = fs.statSync(mountedFilePath)
								const jsonFileStats = fs.statSync(jsonFilePath)

								if (jsonFileStats.mtimeMs < mountedFileStats.mtimeMs) {
									console.info("Cached file is older than file, ignoring");
								} else {
									console.info('Serving cached result from file', jsonFilePath)
									const fileData = fs.readFileSync(jsonFilePath)
									const jsonData = {
										data: JSON.parse(fileData.toString()) as ProcessedDataResponse,
										cached: true,
									};
									return jsonData;
								}
							} catch (error) {
								if( (error as NodeJS.ErrnoException).code === 'ENOENT') {
									console.info('Cached file not found: ' + jsonFilePath)
								} else {
									throw error;
								}
							}
						} 
					}
					
					try {
						const data = await processFile(mountedFilePath);
						if (share.cached) {
							// create cache folder if it doesn't exist
							try {
								if (!fs.existsSync(jsonFolderPath)) {
									fs.mkdirSync(jsonFolderPath, { recursive: true })
								}
								// create lock file
								fs.writeFileSync(lockFilePath, '');
							} catch (error) {
								console.error('Error creating cache folder', error)
								throw error
							}
							// save the result to file
							try {
								fs.writeFileSync(jsonFilePath, JSON.stringify(data))
							} catch (error) {
								console.error("Error writing file", error)
							}
						}
						
						return { data }
					} catch (error) {
						console.error(`Error computing: ${(error as Error).message}`)
						throw (error);
					} finally {
						if (fs.existsSync(lockFilePath)) {
							fs.rmSync(lockFilePath);
						}
					}
				} else {
					console.info('File not found: ' + mountedFilePath)
				}
			}else {
				console.info('-> not matching')
			}
		}
	}

	if (fileUrl.startsWith('http')) {
		const gotStream = got.stream.get(fileUrl);
		const tmpFileBasename = uuid() + '-' + path.basename(new URL(fileUrl).pathname);
		const outStream = fs.createWriteStream('/tmp/' + tmpFileBasename);

		console.info(
			'File is not mounted, attempt download from',
			fileUrl,
			'to /tmp/' + tmpFileBasename
		);
		try {
			await pipeline(gotStream, outStream) 
			console.info('Downloaded file', outStream.path)
			try {
				const data = await processFile(path.normalize(outStream.path as string));
				return { data };
			} catch (error) {
				console.error(`Error computing: ${(error as Error).message}`)
				throw error;
			}
		} catch (error) {
			console.error('Error downloading file', error)
			throw error;
		} finally {
			fs.rmSync(outStream.path);
		}
	}

	// if we get here, no match was found for the file in any of the shares
	console.log('File was not found: ' + fileUrl);
	throw(new FileNotFoundError('File was not found: ' + fileUrl));
}
