// TODO: type safety eslint rewrite, silenced error to test CI pipeline
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import child_process from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { parse as csvLibParse, Options, Parser } from 'csv-parse';

interface scenedetectInfo {
	// scenes is generated from mapping the csv parsing
	// which uses an internal type for the return value of the map
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	scenes?: any;
}

interface getScenesOutput {
	scenedetect: scenedetectInfo;
	error?: string;
}

interface Scene {
	index: number;
	image?: string;
	start: {
		frame: number;
		timecode: string;
		seconds: number;
		image?: string;
	};
	end: {
		frame: number;
		timecode: string;
		seconds: number;
		image?: string;
	};
}

// TODO: method for parsing row to add type safety
/*const parseRow = (index, startFrame, startTimecode, endSeconds, endFrame, endTimecode, endSeconds) => {*/


export async function getScenes(file: string, cachePath?: string) : Promise<getScenesOutput> {
	console.log('Detecting scenes for: ' + file);

	const cmd = 'scenedetect';

	let cleanCachePath = false;

	if (!cachePath) {
		cachePath = path.join('/tmp/scenedetect/', path.basename(file) + '/');
		cleanCachePath = true;
	}

	const output: getScenesOutput = {
		scenedetect: {}
	};

	const detectCmd = `${cmd} -v error -i "${file}" detect-adaptive list-scenes -s --output "${cachePath}" save-images --output "${cachePath}"`;

	const exec = promisify(child_process.exec);
	const csvParse = promisify<Buffer | string, Options, Parser>(csvLibParse);

	const promises = [
		exec(detectCmd)
			.then(({ stderr }) => {
				if (stderr) console.error('stderr', stderr);
				console.info(detectCmd, 'done');
				const csvContent = fs.readFileSync(
					path.join(cachePath, `${path.basename(file, path.extname(file))}-Scenes.csv`),
					'utf8'
				);
				return csvContent;
			})
			.then((csvContent) => {
				return csvParse(csvContent, { delimiter: ',', fromLine: 2 });
			})
			.then((csvData) => {
				output.scenedetect.scenes = csvData.map((row) => {

					const scene: Scene = {
						index: parseInt(row[0]),
						start: {
							frame: parseInt(row[1]),
							timecode: row[2],
							seconds: parseFloat(row[3])
						},
						end: {
							frame: parseInt(row[4]),
							timecode: row[5],
							seconds: parseFloat(row[6])
						}
					};

					if (!cleanCachePath) {
						// declare as fixed length tuple, to be able to access imagePaths directly by index
						const imagePaths: [string, string, string] = ['1', '2', '3'].map((indicies) => {
							return path.join(
								cachePath,
								`${path.basename(file, path.extname(file))}-Scene-${row[0].padStart(
									3,
									'0'
								)}-${indicies.padStart(2, '0')}.jpg`
							);
						}) as [string, string, string];

						for (const imagePath of imagePaths) {
							if (!fs.existsSync(imagePath)) {
								console.warn('Scene image not found:', imagePath);
							} else {
								console.info('Scene image found:', imagePath);
								const imagePathNoScene = imagePath.split('-Scene-').pop();
								if (imagePathNoScene) {
									// rename the file to a shorter name
									const newImagePath = path.join(cachePath, imagePathNoScene);
									fs.renameSync(imagePath, newImagePath);
									console.info('Renamed scene image to:', newImagePath);
									imagePaths[imagePaths.indexOf(imagePath)] = newImagePath;
								} else {
									console.info('Expected scene image to contain "-Scene-" aborting renaming:', imagePath);
								}
							}
						}

						if (fs.existsSync(imagePaths[0])) {
							scene.start.image = path.basename(imagePaths[0]);
						}

						if (fs.existsSync(imagePaths[1])) {
							scene.image = path.basename(imagePaths[1]);
						}

						if (fs.existsSync(imagePaths[2])) {
							scene.end.image = path.basename(imagePaths[2]);
						}
					}

					return scene;
				});

				if (cleanCachePath) {
					fs.rmSync(cachePath, { recursive: true, force: true });
				}
			})
			.catch((error) => {
				console.error('exec error: ' + error);
				output.error = error;
			})
	];

	await Promise.all(promises);
	return output;
}
