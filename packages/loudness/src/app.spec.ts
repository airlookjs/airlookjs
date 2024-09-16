import { build } from './app.js';
import request from "supertest";
import { expect, describe, it, beforeAll } from "vitest";
import { VERSION } from './config.js';
import { LoudnessDataResponse } from './routes.js';

// TODO: share matches and cached
// mock configuration
/*vi.mock('../src/config.ts', async(importOriginal) => {
    const o = await importOriginal<typeof import('../src/config.ts')>()

    return {
        ...o,
        config: {
            port: 8080,
            route: '/api/get',
            shares: [
                {
                    name: 'test',
                    mount: `${import.meta.dirname}/../tests`,// '../tests',
                    matches: [RegExp('tests/(.*)')],
                    cached: false,
                }
            ]
        },
    }
});*/

const routePrefix = '/api/test';

const app = await build({
  routePrefix,
  shares: [{
      name: 'test',
      mount: `${import.meta.dirname}/../tests`,// '../tests',
      matches: [RegExp('tests/(.*)')],
      systemRoot: 'tests/',
      cached: false,
  }]});

//const server = loudnessServer.server;

beforeAll(async () => {
    await app.ready();
})

describe('GET /', () => {
    it('should return 200 OK', async () => {
        const res = await request(app.server).get(`${routePrefix}`);
        expect(res.status).toBe(200);
    });
});

describe('loudness', () => {
    it('should return 400 Bad Request with no query params', async () => {
        const res = await request(app.server).get(`${routePrefix}/get`);
        expect(res.status).toBe(400);
    });

    it('should return valid result for loudness', { timeout: 10000 }, async () => {

        // Test file from https://tech.ebu.ch/publications/ebu_loudness_test_set
        const TEST_FILE = 'seq-3341-13-1-24bit.wav';

        const res = await request(app.server).get(`${routePrefix}/get?file=tests/${TEST_FILE}`);

        const body = res.body as LoudnessDataResponse;

        expect(res.status).toBe(200);
        expect(body.loudness).toEqual({"sampleRate":0.02,"lra":0,"lufs":-25,"integratedValues":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-23,-23,-23,-23,-23,-23.6,-23.6,-23.6,-23.6,-23.6,-24.2,-24.2,-24.2,-24.2,-24.2,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25,-25],"momentaryValues":[-36,-33,-31.2,-30,-29,-28.2,-27.6,-27,-26.5,-26,-25.6,-25.2,-24.9,-24.5,-24.2,-24,-23.7,-23.5,-23.2,-23,-23.2,-23.5,-23.7,-24,-24.2,-24.5,-24.9,-25.2,-25.6,-26,-26.5,-27,-27.6,-28.2,-29,-30,-31.2,-33,-36,-65.7,-89.8,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90,-90],"shorttermValues":[-44.8,-41.7,-40,-38.7,-37.8,-37,-36.3,-35.7,-35.2,-34.8,-34.3,-34,-33.6,-33.3,-33,-32.7,-32.5,-32.2,-32,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7,-31.7]});

        expect(body.version).toBe(VERSION);
        expect(body.cached).toBe(false);

    });

    // TODO: test caching on shares
    // TODO: test sample rate
    // TODO: test multiple shares
    // TODO: test url download - create static server to serve the same file over http
});
