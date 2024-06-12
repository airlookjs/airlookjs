// TODO: type safety eslint rewrite, silenced error to test CI pipeline
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import child_process from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { parse as csvLibParse, type Options, type Parser } from 'csv-parse';

export interface ScenesOutput {
	scenedetect: {
		scenes: Scene[]
	}
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

// type of row from scene detect csv
type SceneDetectRow = [string, string, string, string, string, string, string];

export const SCENEDETECT_CMD = 'scenedetect';

export const scenedetectVersion = async () : Promise<string> => {
  const execFile = promisify(child_process.execFile)

  const { stdout, stderr } = await execFile(SCENEDETECT_CMD, ['version'])

  if (stderr) {
    console.error('exec stderr', stderr)
    throw new Error(stderr)
  }

  return stdout
}


const findSceneImages = (sceneNumber: string, cachePath: string): [string, string, string] => {
	return ['1', '2', '3'].map((indicies) => {
		return path.join(
			cachePath,
			`${sceneNumber.padStart(3, '0')}-${indicies.padStart(2, '0')}.jpg`
		);
	}) as [string, string, string];
}


const mapCsvToScenes = (csvData: Parser, cachePath: string, cleanCachePath: boolean): Scene[] => {
	const mappedScenes = csvData.map(([sceneNumber, startFrame, startTimecode, startTimeSeconds, endFrame, endTimecode, endTimeSeconds]: SceneDetectRow) => {
		const scene: Scene = {
			index: parseInt(sceneNumber),
			start: {
				frame: parseInt(startFrame),
				timecode: startTimecode,
				seconds: parseFloat(startTimeSeconds)
			},
			end: {
				frame: parseInt(endFrame),
				timecode: endTimecode,
				seconds: parseFloat(endTimeSeconds)
			}
		};

		if (!cleanCachePath) {
			// declare as fixed length tuple, to be able to access imagePaths directly by index
			const imagePaths = findSceneImages(sceneNumber, cachePath);
			console.log(imagePaths);
			// renameSceneImages(imagePaths, cachePath);

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

	return mappedScenes as unknown as Scene[];
}
export async function getScenes({ file, cachePath }: { file: string, cachePath?: string }) : Promise<ScenesOutput> {
	console.log('Detecting scenes for: ' + file);

	let cleanCachePath = false;

	if (!cachePath) {
		cachePath = path.join('/tmp/scenedetect/', path.basename(file) + '/');
		cleanCachePath = true;
	}

	const execFile = promisify(child_process.execFile)
	const csvParse = promisify<Buffer | string, Options, Parser>(csvLibParse);

	const { stderr } = await execFile(
		SCENEDETECT_CMD, [
			'--verbosity', 'error', 
			'--input', file, 
			'detect-adaptive',
			'list-scenes',
			'--skip-cuts',
			'--output', cachePath,
			'save-images', 
			'--filename', '$SCENE_NUMBER-$IMAGE_NUMBER',
			'--output', cachePath
		]
	);

	if (stderr) {
		console.error('stderr', stderr);
	}

	const csvContent = fs.readFileSync(
		path.join(cachePath, `${path.basename(file, path.extname(file))}-Scenes.csv`),
		'utf8'
	);

	const csvData = await csvParse(csvContent, { delimiter: ',', fromLine: 2 });
	const output: ScenesOutput = {
		scenedetect:  {
			scenes: mapCsvToScenes(csvData, cachePath, cleanCachePath)
		}
	}

	if (cleanCachePath) {
		fs.rmSync(cachePath, { recursive: true, force: true });
	}

	return output;
}
