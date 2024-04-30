import child_process from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
type numberOrNullArray = (number | null)[];
interface iOutput {
  sampleRate: number;
  lra?: number;
  lufs?: number;
  integratedValues?: numberOrNullArray;
  momentaryValues?: numberOrNullArray;
  shorttermValues?: numberOrNullArray;
  error?: child_process.ExecException | string;
  warning?: string;
};

export function getLoudness(filePath: string, sampleRate: number, accessAirlookDrive: boolean, callback: (data: iOutput) => void) {
  console.log("Measuring loudness for: " + filePath);

  var cmd = path.resolve("loudness-scanner-build", "loudness.exe"); // TODO: move to config

  var accessAirlookDrive = true;

  if (os.platform() === 'darwin') {
      cmd = './loudness-scanner-osx/build/loudness';
  } else if (os.platform() === 'linux') {
      cmd = './loudness-scanner/build/loudness';
  }
  const output: iOutput = {
    sampleRate: sampleRate, // in seconds, has to be at least 1 Hz to comply with ebu 128 // error on sampleRate not conforming to ebu 128
  };

  const integratedCmd = `${cmd} dump -i ${sampleRate} ${filePath}`

  const momentaryCmd = `${cmd} dump -m ${sampleRate} ${filePath}`

  const shorttermCmd = `${cmd} dump -s ${sampleRate} ${filePath}`

  const scanCmd = `${cmd} scan --lra ${filePath}`;

  console.log("Running: " + scanCmd);
  child_process.exec(scanCmd, function (error, stdout, stderr) {
    if (error !== null) {
      console.error('exec error: ' + error);
      output.error = error;
      callback(output);
      return;
    }

    //console.log(stdout);
    /* example output
      Loudness,     LRA
      -22.5 LUFS, 10.5 LU, tmp.mp4
      -------------------------------------------------------------------------------
      -22.5 LUFS, 10.5 LU
      */

    // parsefloat converts -inf to NaN
    //console.log(err);

    var nums = stdout.toString().split('\n')[0].split(" ");
    var lufs = parseFloat(nums[0]);

    var lraIndex = 2;
    if (nums[2] == ' ' || nums[2] == '' || isNaN(Number(nums[2]))) {
      lraIndex = 3;
    }
    var lra = parseFloat(nums[lraIndex]);

    if (isNaN(lufs)) {
      console.error('unexpected value, error was: ' + stderr);
      output.error = 'unexpected value, error was: ' + stderr;
      callback(output);
      return;
    }

    output.lra = lra;
    output.lufs = lufs;

    console.log("Running: " + integratedCmd);
    child_process.exec(integratedCmd, function (err, stdout, stderr) {
      console.error(stderr);

      const lines: string[] = stdout.toString().split('\n');
      lines.pop();
      output.integratedValues = [];
      lines.forEach(function (line) {
        if (os.platform() !== 'darwin' && os.platform() !== 'linux') {
          if (line == '-1.$\r') {
            output.integratedValues.push(null);
            // return early as we otherwise wants to parse the line as float
            return;
          } 
        } 
        output.integratedValues.push(parseFloat(line));
      });

      console.log("Running: " + momentaryCmd);
      child_process.exec(momentaryCmd, function (err, stdout, stderr) {
        console.error(stderr);

        var lines = stdout.toString().split('\n');
        lines.pop();
        output.momentaryValues = [];
        lines.forEach(function (line) {
            output.momentaryValues.push(parseFloat(line));
        });

        console.log("Running: " + shorttermCmd);
        child_process.exec(shorttermCmd, function (err, stdout, stderr) {
          console.error(stderr);

          var lines = stdout.toString().split('\n');
          lines.pop();
          output.shorttermValues = [];
          lines.forEach(function (line) {
            output.shorttermValues.push(parseFloat(line));
          });

          if (accessAirlookDrive) {
            // save json file to airlook drive
            var dataOutputFileName = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)) + "_loudness.json");
            fs.writeFile(dataOutputFileName, JSON.stringify(output), function (err) {
              if (err) {
                output.warning = "Failed to write data file";
                console.log(err);
                callback(output);
                return;
              }
              console.log("Loudness data saved to: " + dataOutputFileName);
              callback(output);
            });
          } else {
            callback(output);
          }
        });
      });
    });
  });
};
