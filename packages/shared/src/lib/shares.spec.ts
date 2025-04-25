import { processFileOnShareOrHttp } from './shares.js';
import fs from 'node:fs';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';

const shares = [
  {
    name: 'testscached',
    mount: `${import.meta.dirname}/../../tests`, // '../tests',
    matches: [RegExp('testscached/(.*)')],
    systemRoot: 'tests/',
    cached: true,
  },
];

const mockFunction = vi
  .fn()
  .mockImplementation(({ file }: { file: string }) => {
    return {
      testcase: {
        file,
      },
    };
  });

const args: Parameters<typeof processFileOnShareOrHttp>[0] = {
  fileUrl: 'testscached/testfile.json',
  ignoreCache: false,
  processFile: mockFunction,
  shares,
  relativeCacheFolderPath: '.cache/testcase',
  version: '1.0',
  canProcessFileOnHttp: false,
};

const respSharedData = {
  cached: false,
  cachedAssetsPath: 'tests/.cache/testcase',
  data: {
    testcase: {
      file: expect.stringMatching(
        /^.*\/shared\/tests\/testfile.json$/
      ) as unknown,
    },
  },
  version: '1.0',
};

describe('processFileOnShareOrHttp', () => {
  describe.sequential(
    'calling processFileOnShareHttp with caching more than once',
    () => {
      beforeEach(() => {
        mockFunction.mockClear();
      });

      afterEach(() => {
        if (fs.existsSync(`${import.meta.dirname}/../../tests/.cache`)) {
          fs.rmSync(`${import.meta.dirname}/../../tests/.cache`, {
            recursive: true,
          });
        }
      });

      it('only calls process function once', async () => {
        const resp = await processFileOnShareOrHttp(args);
        const resp2 = await processFileOnShareOrHttp({ ...args });

        expect(mockFunction).toBeCalledTimes(1);

        expect(resp).toEqual(respSharedData);
        expect(resp2).toEqual({
          ...respSharedData,
          cached: true,
        });
      });

      // Tried making this test as an E2E test, but stubbing npm_package_version proved difficult.
      describe('if method receives new version', () => {
        beforeEach(() => {
          mockFunction.mockClear();
        });

        it('calls process again', async () => {
          const resp = await processFileOnShareOrHttp(args);
          expect(mockFunction).toBeCalledTimes(1);
          const resp2 = await processFileOnShareOrHttp({
            ...args,
            version: '2.0',
          });

          expect(mockFunction).toBeCalledTimes(2);

          expect(resp).toEqual(respSharedData);
          expect(resp2).toEqual({
            ...respSharedData,
            version: '2.0',
          });
        });
      });
    }
  );
});
