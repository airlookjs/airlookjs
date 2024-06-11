import { server } from './server.js';
import request from 'supertest';
import express, { type Express } from "express";
import fs from 'fs';
import { expect, describe, it, vi, beforeEach, afterEach, afterAll } from 'vitest';

import * as configExports from './config.js';

const TEST_FILE = 'test_file.mp4'; 

const defaultConfig = {
	port: 8080,
	route: '/api/scenedetect',
	version: '1.0',
	shares: [],
	environment: ''
};

describe('GET /', () => {
	it('should return 200 OK', async () => {
		const res = await request(server).get('/');
		expect(res.status).toBe(200);
	});
});

describe('scenedetect', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('shares that are not cached', () => {
		beforeEach(() => {
			vi.spyOn(configExports, 'config', 'get').mockReturnValue({
				...defaultConfig,
				shares: [
					{
						name: 'test',
						mount: `${import.meta.dirname}/../tests`,// '../tests',
						matches: [RegExp('tests/(.*)')],
						cached: false,
						uncRoot: '',
						systemRoot: '',
					}
				]
			});
		});

    it('should return 400 Bad Request with no query params', async () => {
			const res = await request(server).get('/api/scenedetect');
			expect(res.status).toBe(400);
    });

    it('should return valid result for a valid file and use default output', { timeout: 10000 }, async () => {
			const res = await request(server).get(`/api/scenedetect?file=tests/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
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
				  version: "1.0",
				}
			);
		});
	});

	// needs to be sequential as first run will write cache files
	describe.sequential('shares that are cached', () => {
		beforeEach(() => {
			vi.spyOn(configExports, 'config', 'get').mockReturnValue({
				...defaultConfig,
				shares: [
					{
						name: 'test',
						mount: `${import.meta.dirname}/../tests`,// '../tests',
						matches: [RegExp('tests/(.*)')],
						cached: true,
						uncRoot: '',
						systemRoot: '',
					}
				]
			});
		});

		afterAll(() => {
			if(fs.existsSync(`${import.meta.dirname}/../tests/.cache`)) {
				fs.rmdirSync(`${import.meta.dirname}/../tests/.cache`, {recursive: true})
			}
		});

    it('returns non cached file', { timeout: 10000 }, async () => {
			const res = await request(server).get(`/api/scenedetect?file=tests/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
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
				  version: "1.0",
				}
			);
    });

    it('returns cached file', { timeout: 10000 }, async () => {
			const res = await request(server).get(`/api/scenedetect?file=tests/${TEST_FILE}`);

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
				  version: "1.0",
				}
			);
    });
  });

	describe('download file over url', ()  => {
		let app: Express;
		beforeEach(() => {
			vi.spyOn(configExports, 'config', 'get').mockReturnValue({
				...defaultConfig,
				shares: [
					{
						name: 'no-mount-just-http',
						mount: ``,
						matches: [],
						cached: false,
						uncRoot: '',
						systemRoot: '',
					}
				]
			});

			app = express();
			// Setup express static middleware to look for files in the api directory for all requests starting with /api
			app.use(`/tests`, express.static(`${import.meta.dirname}/../tests`) , function(_req, res){
				// Optional 404 handler
				res.status(404);
				res.json({error:{code:404}})
			});

			app.listen('9090');
		});

		it('should return 200 OK', async () => {
			const res = await request(server).get(`/api/scenedetect?file=http://127.0.0.1:9090/tests/${TEST_FILE}`);

			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				{
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
				  version: "1.0",
				}
			);
		});
	});

});
