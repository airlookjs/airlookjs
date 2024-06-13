import child_process from 'child_process'
import path from 'node:path';
import { promisify } from 'util'

export const LOUDNESS_CMD = path.resolve(import.meta.dirname, '../bin/loudness');

type numberOrNullArray = (number | null)[];
export interface LoudnessData {
		sampleRate: number;
		lra?: number;
		lufs?: number;
		integratedValues?: numberOrNullArray;
		momentaryValues?: numberOrNullArray;
		shorttermValues?: numberOrNullArray;
		warning?: string;
}
export interface LoudnessOutput {
  loudness: LoudnessData
};

const exec = promisify(child_process.execFile)

const loudnessScan = async (file: string) => {
	const result = await loudnessExec(['scan', '--lra', file])
	const nums = result.toString().split('\n')?.[0]?.split(' ') ?? [];
	const lufs = parseFloat(nums[0] ?? '');

	let lraIndex = 2
	if (nums[2] == ' ' || nums[2] == '' || isNaN(Number(nums[2]))) {
		lraIndex = 3
	}
	const lra = parseFloat(nums[lraIndex] ?? '');

	if (isNaN(lufs)) {
		// this used to print stderr
		console.error('unexpected value');
		throw new Error('unexpected value');
	}

	return {
		lra,
		lufs
	}
}

const DUMP_OPTIONS = {
	integrated: '-i',
	momentary: '-m',
	shortterm: '-s'
} as const;

const loudnessDump = async (type: keyof typeof DUMP_OPTIONS, sampleRate: number, file: string) => {
	const result = await loudnessExec(['dump', DUMP_OPTIONS[type], sampleRate.toString(), file])

	const lines = result.toString().split('\n')
	lines.pop()
		//output.loudness.shorttermValues = []

	return {
		[`${type}Values`]: lines.map((line) => {
			return parseFloat(line)
		})
	}
}

const loudnessExec = async (args: string[]) => {
	console.info('Running', LOUDNESS_CMD, 'with args', args)
	const { stdout, stderr } = await exec(LOUDNESS_CMD, args)

	if (stderr) {
		// progress is reported to stderr
		console.error('stderr', stderr)
		//throw new Error(stderr)
	}
	return stdout
}

//import child_process from 'child_process';
//import { promisify } from 'util';
//import { LOUDNESS_CMD, config } from './config.js';
//const exec = promisify(child_process.execFile)

export async function loudnessVersion() : Promise<string> {
  return await loudnessExec(["--version"])
}

export async function getLoudness({ file, sampleRate }: { file: string, sampleRate: number }): Promise<LoudnessOutput> {
	console.log('Measuring loudness for: ' + file)
	// sampleRatein seconds, has to be at least 1 Hz to comply with ebu 128 // error on sampleRate not conforming to ebu 128

	const [scan, integrated, momentary, shortterm] = await Promise.all([
		loudnessScan(file),
		loudnessDump('integrated', sampleRate, file),
		loudnessDump('momentary', sampleRate, file),
		loudnessDump('shortterm', sampleRate, file),
	]).catch((error) => {
		throw error
	})

	return {
		loudness: {
			sampleRate,
			...scan,
			...integrated,
			...momentary,
			...shortterm
		}
	}

}
