import { build } from './app.js';
import request from 'supertest';
import { VERSION } from './config.js';
import express, { type Express } from "express";
import fs from 'fs';
import { expect, describe, it, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { ScenedetectDataResponse } from './routes.js'

const TEST_FILE = 'test_file.mp4'; 

const routePrefix = '/api/test';
const cacheDir = '.cache/scenedetecttest';
const fullCacheDir = '.cache/scenedetecttest/test_file.mp4'

const app = await build({
  routePrefix,
  scenedetect: {
    cacheDir
  },
  shares: [
    {
      name: 'test',
      mount: `${import.meta.dirname}/../tests`,// '../tests',
      matches: [RegExp('tests/(.*)')],
			systemRoot: 'tests/',
      cached: false
    },
    {
      name: 'testcached',
      mount: `${import.meta.dirname}/../tests`,// '../tests',
      matches: [RegExp('testscached/(.*)')],
			systemRoot: 'tests/',
      cached: true
    }
	]
});

beforeAll(async () => {
	await app.ready();
})

describe('GET /', () => {
	it('should return 200 OK', async () => {
		const res = await request(app.server).get(routePrefix);
		expect(res.status).toBe(200);
	});
});

describe('scenedetect', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('shares that are not cached', () => {
    it('should return 400 Bad Request with no query params', async () => {
			const res = await request(app.server).get(`${routePrefix}/get`);
			expect(res.status).toBe(400);
    });

    it('should return valid result for a valid file', { timeout: 10000 }, async () => {
			const res = await request(app.server).get(`${routePrefix}/get?file=tests/${TEST_FILE}`);
      const body = res.body as ScenedetectDataResponse;

			expect(res.status).toBe(200);
			expect(body).toEqual(
				{
					cached: false,
				  scenedetect: {
				    scenes: [
				      {
				        end: {
				          frame: 901,
				          seconds: 30.033,
				          timecode: "00:00:30.033",
				        },
				        index: 1,
				        start: {
				          frame: 1,
				          seconds: 0,
				          timecode: "00:00:00.000",
				        },
				      },
				    ],
				  },
				  version: VERSION,
				}
			);
		});
	});

	// needs to be sequential as first run will write cache files
	describe.only.sequential('shares that are cached', () => {
		afterAll(() => {
			if(fs.existsSync(`${import.meta.dirname}/../tests/.cache`)) {
				fs.rmSync(`${import.meta.dirname}/../tests/.cache`, {recursive: true})
			}
		});

    it('returns non cached file', { timeout: 10000 }, async () => {
			const res = await request(app.server).get(`${routePrefix}/get?file=testscached/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
					cached: false,
				  scenedetect: {
				    scenes: [
				      {
				        end: {
				          frame: 901,
									image: "001-03.jpg",
									seconds: 30.033,
				          timecode: "00:00:30.033",
				        },
								image: "001-02.jpg",
				        index: 1,
				        start: {
				          frame: 1,
									image: "001-01.jpg",
				          seconds: 0,
				          timecode: "00:00:00.000",
				        },
				      },
				    ],
				  },
					cachedAssetsPath: "tests/.cache/scenedetecttest",
				  version: VERSION,
				}
			);
    });

		it('has a cachePath', () => {
			expect(fs.existsSync(`${import.meta.dirname}/../tests/${fullCacheDir}`)).toEqual(true);
		});

    it('returns cached file', { timeout: 10000 }, async () => {
			const res = await request(app.server).get(`${routePrefix}/get?file=testscached/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
					cached: true,
				  scenedetect: {
				    scenes: [
				      {
				        end: {
				          frame: 901,
									image: "001-03.jpg",
									seconds: 30.033,
				          timecode: "00:00:30.033",
				        },
								image: "001-02.jpg",
				        index: 1,
				        start: {
				          frame: 1,
									image: "001-01.jpg",
				          seconds: 0,
				          timecode: "00:00:00.000",
				        },
				      },
				    ],
				  },
					cachedAssetsPath: "tests/.cache/scenedetecttest",
				  version: VERSION,
				}
			);
    });
  });

	describe('download file over url', ()  => {
		let staticServer: Express;
		beforeAll(() => {
			staticServer = express();
			// Setup express static middleware to look for files in the api directory for all requests starting with /api
			staticServer.use(`/notmounted`, express.static(`${import.meta.dirname}/../tests`) , function(_req, res){
				// Optional 404 handler
				res.status(404);
				res.json({error:{code:404}})
			});

			staticServer.listen('9090');
		});

		it('should return 200 OK', async () => {
			const res = await request(app.server).get(`${routePrefix}/get?file=http://127.0.0.1:9090/notmounted/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
					cached: false,
				  scenedetect: {
				    scenes: [
				      {
				        end: {
				          frame: 901,
									seconds: 30.033,
				          timecode: "00:00:30.033",
				        },
				        index: 1,
				        start: {
				          frame: 1,
				          seconds: 0,
				          timecode: "00:00:00.000",
				        },
				      },
				    ],
				  },
				  version: VERSION,
				}
			);
		});
	});
});
