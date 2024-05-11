import child_process from 'child_process'
import { promisify } from 'util'
import os from 'os'
import { LOUDNESS_CMD } from './config.js';

export type numberOrNullArray = (number | null)[];

export interface LoudnessData {
		sampleRate: number;
		lra?: number;
		lufs?: number;
		integratedValues?: numberOrNullArray;
		momentaryValues?: numberOrNullArray;
		shorttermValues?: numberOrNullArray;
		warning?: string;
}
export interface GetLoudnessOutput {
  loudness: LoudnessData
  error?: child_process.ExecException | string;
};

export async function getLoudness(file: string, sampleRate: number) {
	console.log('Measuring loudness for: ' + file)

	
	const output: GetLoudnessOutput = {
		loudness: {
			sampleRate: sampleRate // in seconds, has to be at least 1 Hz to comply with ebu 128 // error on sampleRate not conforming to ebu 128
		}
	}

	const integratedCmd = `${LOUDNESS_CMD} dump -i ${sampleRate} "${file}"`
	const momentaryCmd = `${LOUDNESS_CMD} dump -m ${sampleRate} "${file}"`
	const shorttermCmd = `${LOUDNESS_CMD} dump -s ${sampleRate} "${file}"`
	const scanCmd = `${LOUDNESS_CMD} scan --lra "${file}"`

	const exec = promisify(child_process.exec)

	const promises = [
		exec(scanCmd)
			.then(({ stdout, stderr }) => {
				if (stderr) console.error('stderr', stderr)
				console.info(scanCmd, 'done')
				const nums = stdout.toString().split('\n')?.[0]?.split(' ') ?? [];
				const lufs = parseFloat(nums[0] ?? '');

				let lraIndex = 2
				if (nums[2] == ' ' || nums[2] == '' || isNaN(Number(nums[2]))) {
					lraIndex = 3
				}
				const lra = parseFloat(nums[lraIndex] ?? '');

				if (isNaN(lufs)) {
					console.error('unexpected value, error was: ' + stderr);
					output.error = 'unexpected value, error was: ' + stderr;
					return output;
				}

				output.loudness.lra = lra;
				output.loudness.lufs = lufs;

        return output;
			})
			.catch((error) => {
				console.error('exec error: ' + error);
				output.error = error;
			}),

		exec(integratedCmd)
			.then(({ stdout, stderr }) => {
				if (stderr) console.error('stderr', stderr);
				console.info(integratedCmd, 'done')
				const lines = stdout.toString().split('\n')
				lines.pop()
				output.loudness.integratedValues = [];
        lines.forEach((line) => {
          if (os.platform() !== 'darwin' && os.platform() !== 'linux') {
            if (line == '-1.$\r') {
              output.loudness.integratedValues!.push(null);
              // return early to avoid pushing twice
              return;
            } 
          } 
          output.loudness.integratedValues!.push(parseFloat(line));
        });
			})
			.catch((error) => {
				console.error('exec error: ' + error)
				output.error = error
			}),

		exec(momentaryCmd)
			.then(({ stdout, stderr }) => {
				if (stderr) console.error('stderr', stderr)
				console.info(momentaryCmd, 'done')
				const lines = stdout.toString().split('\n')
				lines.pop()
				output.loudness.momentaryValues = []
				lines.forEach(function (line) {
					output.loudness.momentaryValues!.push(parseFloat(line))
				})
			})
			.catch((error) => {
				console.error('exec error: ' + error)
				output.error = error
			}),

		exec(shorttermCmd)
			.then(({ stdout, stderr }) => {
				if (stderr) console.error('stderr', stderr)
				console.info(shorttermCmd, 'done')
				const lines = stdout.toString().split('\n')
				lines.pop()
				output.loudness.shorttermValues = []
				lines.forEach(function (line) {
					output.loudness.shorttermValues!.push(parseFloat(line))
				})
			})
			.catch((error) => {
				console.error('exec error: ' + error)
				output.error = error
			})
	]

	await Promise.all(promises)
	return output
}
