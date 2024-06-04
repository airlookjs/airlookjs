import { server } from './server.js';
import request from "supertest";
// import express, { type Express } from "express";
import * as configExports from './config.js';

import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";

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

	describe('shares that are cached', () => {
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

    it('should return valid result for a valid file and use default output', { timeout: 10000 }, async () => {
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
});
