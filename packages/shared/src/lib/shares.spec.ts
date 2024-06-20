import { processFileOnShareOrHttp } from './shares.js';
import fs from 'node:fs';
import { expect, describe, it, vi, afterAll } from 'vitest';

const shares = [
  {
    name: 'testscached',
    mount: `${import.meta.dirname}/../../tests`,// '../tests',
    matches: [RegExp('testscached/(.*)')],
    cached: true
  }
]
const mockFunction = vi.fn().mockImplementation(({ file }: { file: string }) => {
  return {
    testcase: {
      file
    }
  }
});

describe('processFileOnShareOrHttp', () => {
  describe('calling processFileOnShareHttp with caching more than once', () => {
		afterAll(() => {
			if(fs.existsSync(`${import.meta.dirname}/../../tests/.cache`)) {
				fs.rmSync(`${import.meta.dirname}/../../tests/.cache`, {recursive: true})
			}
		});

    it('only calls process function once', async () => {
      const args = {
        cacheFileExtension: 'testcase.json',
        lockFileExtension: 'testcase.lock',
        fileUrl: 'testscached/testfile.json',
        ignoreCache: false,
        processFile: mockFunction,
        relativeCacheFolderPath: '.cache/testcase',
        shares,
        version: '1.0',
        canProcessFileOnHttp: false
      };

      const resp = await processFileOnShareOrHttp(args);
      const resp2 = await processFileOnShareOrHttp(args);

      expect(mockFunction).toBeCalledTimes(1);      

      const respSharedData = {
        data: {
          testcase: {
            file: expect.stringMatching(/^.*\/shared\/tests\/testfile.json$/) as unknown,
          },
        },
        version: "1.0",
      }
      expect(resp).toEqual(
        {
          cached: false,
          ...respSharedData
        }
      );
      expect(resp2).toEqual(
        {
          cached: true,
          cachedVersion: "1.0",
          ...respSharedData
        }
      );
    })
  });
});
