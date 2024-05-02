import { getLoudness } from "../src/loudness";
import child_process from 'child_process';
import util from 'util';

jest.mock('child_process');
// @ts-ignore 
child_process.exec.mockImplementation(() => {});

describe("getLoudness", () => {
  describe('with working data', () => {
    let sampleRate = 0.02;
    let fileName = "filename";
  
    let lufsMock = "3.6"
    let lraMock = "-22.2"
    let scanCmdMockData: { stdout:string, stderr?: string } = { stdout: `${lufsMock} 0 ${lraMock}\n` };
    let integratedCmdMockData = { stdout: "-21.0\n-23.7\n-2.7\n0\n" };
    let momentaryCmdMockData = { stdout: "-48.5\n-35.7\n29.6\n-24.6\n-21.6\n" };
    let shorttermCmdMockData = { stdout: "-57.2\n-44.5\n-38.4\n-33.3\n-28.2\n"} ;
  
    beforeEach(() => {
      jest.spyOn(util, 'promisify').mockImplementation(() => {
        return async (argument: string) => {
          switch (argument) {
            case `./loudness-scanner-osx/build/loudness scan --lra \"${fileName}\"`:
            case `./loudness-scanner/build/loudness scan --lra \"${fileName}\"`:
              return scanCmdMockData;
            case `./loudness-scanner-osx/build/loudness dump -i ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner/build/loudness dump -i ${sampleRate} \"${fileName}\"`:
              return integratedCmdMockData;
            case `./loudness-scanner-osx/build/loudness dump -m ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner/build/loudness dump -m ${sampleRate} \"${fileName}\"`:
              return momentaryCmdMockData;
            case `./loudness-scanner-osx/build/loudness dump -s ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner/build/loudness dump -s ${sampleRate} \"${fileName}\"`:
              return shorttermCmdMockData;
            default:
              // We should not end up in default
              expect(argument).toBe("something else")
              return { stdout: "default" };
          }
        }
      });
    });
  
    test("returns proper output", async () => {
      sampleRate = 0.05;
      fileName = "foo.bar";
      const loudnessOutput = await getLoudness(fileName, sampleRate);
      expect(loudnessOutput.loudness.sampleRate).toEqual(sampleRate);
      expect(loudnessOutput.loudness.lufs).toEqual(3.6);
      expect(loudnessOutput.loudness.lra).toEqual(-22.2);
      expect(loudnessOutput.loudness.integratedValues).toEqual([-21, -23.7, -2.7, 0]);
      expect(loudnessOutput.loudness.momentaryValues).toEqual([-48.5, -35.7, 29.6, -24.6, -21.6]);
      expect(loudnessOutput.loudness.shorttermValues).toEqual([-57.2, -44.5, -38.4, -33.3, -28.2]);
    });

    test('scan cmd data has lra in third thid index', async () => {
      sampleRate = 0.05;
      fileName = "foo.bar";
      lraMock = '42.1'
      // extra space is necessary to test the index logic
      scanCmdMockData = { stdout: `${lufsMock} 0  ${lraMock}` };

      const loudnessOutput = await getLoudness(fileName, sampleRate);
      expect(loudnessOutput.loudness.lra).toEqual(42.1);
    });

    describe('lufs has nan in data', () => {
  
      test('calls console error and loudness output contains error', async  () => {
        lufsMock = "NaN";
        scanCmdMockData = { stdout: `${lufsMock} 0 ${lraMock}\n`, stderr: "something went wrong" };
        console.error = jest.fn();
        const loudnessOutput = await getLoudness(fileName, sampleRate);
        expect(console.error).toHaveBeenNthCalledWith(1, "stderr", "something went wrong");
        expect(console.error).toHaveBeenNthCalledWith(2, "unexpected value, error was: something went wrong");
        expect(loudnessOutput.error).toEqual("unexpected value, error was: something went wrong");
      });
    });
  });


  describe('the promises respond with error', () => {
    let sampleRate = 0.02;
    let fileName = "filename";
    // let scanError = "testing error"
    // let integratedError = "testing error"
    // let momentaryError = "testing error"
    let error = new Error("testing error");
    

    beforeEach(() => {
      jest.spyOn(util, 'promisify').mockImplementation(() => {
        return async (argument: string) => {
          switch (argument) {
            case `./loudness-scanner-osx/build/loudness scan --lra \"${fileName}\"`:
            case `./loudness-scanner/build/loudness scan --lra \"${fileName}\"`:
            case `./loudness-scanner-osx/build/loudness dump -i ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner/build/loudness dump -i ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner-osx/build/loudness dump -m ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner/build/loudness dump -m ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner-osx/build/loudness dump -s ${sampleRate} \"${fileName}\"`:
            case `./loudness-scanner/build/loudness dump -s ${sampleRate} \"${fileName}\"`:
              throw error;
            default:
              // We should not end up in default
              expect(argument).toBe("something else")
              return { stdout: "default" };
          }
        }
      });
    });


    test('console error is called and output contains error', async  () => {
      console.error = jest.fn();
      const loudnessOutput = await getLoudness(fileName, sampleRate);
      expect(console.error).toHaveBeenNthCalledWith(1, "exec error: Error: testing error");
      expect(console.error).toHaveBeenNthCalledWith(2, "exec error: Error: testing error");
      expect(console.error).toHaveBeenNthCalledWith(3, "exec error: Error: testing error");
      expect(console.error).toHaveBeenNthCalledWith(4, "exec error: Error: testing error");
      expect(loudnessOutput.error).toEqual(error);
    });
  });
});