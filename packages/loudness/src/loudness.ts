import child_process from 'child_process'
import path from 'path'
import { promisify } from 'util'
import os from 'os'

export type numberOrNullArray = (number | null)[];

export interface GetLoudnessOutput {
  loudness: {
    sampleRate: number;
    lra?: number;
    lufs?: number;
    integratedValues?: numberOrNullArray;
    momentaryValues?: numberOrNullArray;
    shorttermValues?: numberOrNullArray;
    warning?: string;
  }
  error?: child_process.ExecException | string;
};

export async function getLoudness(file: string, sampleRate: number) {
	console.log('Measuring loudness for: ' + file)

	var cmd = path.resolve('loudness-scanner-build', 'loudness.exe'); // TODO: move to config

	if (os.platform() === 'darwin') {
		cmd = './loudness-scanner-osx/build/loudness'
	} else if (os.platform() === 'linux') {
		cmd = './loudness-scanner/build/loudness'
	}
	const output: GetLoudnessOutput = {
		loudness: {
			sampleRate: sampleRate // in seconds, has to be at least 1 Hz to comply with ebu 128 // error on sampleRate not conforming to ebu 128
		}
	}

	const integratedCmd = `${cmd} dump -i ${sampleRate} "${file}"`
	const momentaryCmd = `${cmd} dump -m ${sampleRate} "${file}"`
	const shorttermCmd = `${cmd} dump -s ${sampleRate} "${file}"`
	const scanCmd = `${cmd} scan --lra "${file}"`

	const exec = promisify(child_process.exec)

	const promises = [
		exec(scanCmd)
			.then(({ stdout, stderr }) => {
				if (stderr) console.error('stderr', stderr)
				console.info(scanCmd, 'done')
				var nums = stdout.toString().split('\n')?.[0]?.split(' ') || [];
				var lufs = parseFloat(nums[0] ?? '');

				var lraIndex = 2
				if (nums[2] == ' ' || nums[2] == '' || isNaN(Number(nums[2]))) {
					lraIndex = 3
				}
				var lra = parseFloat(nums[lraIndex] ?? '');

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
				var lines = stdout.toString().split('\n')
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
				var lines = stdout.toString().split('\n')
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
				var lines = stdout.toString().split('\n')
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
