import { server } from './server.js';
import request from "supertest";
import { expect, describe, it, vi } from "vitest";


// TODO: share matches and cached
// mock configuration
vi.mock('../src/config.ts', async(importOriginal) => {
    const o = await importOriginal<typeof import('../src/config.ts')>()

    return {
        ...o,
        config: {
            port: 8080,
            route: '/api/loudness',
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
});

describe('GET /', () => {
    it('should return 200 OK', async () => {
        const res = await request(server).get('/');
        expect(res.status).toBe(200);
    });
});

describe('loudness', () => {

    it('should return 400 Bad Request with no query params', async () => {
        const res = await request(server).get('/api/loudness');
        console.log(res.body);
        expect(res.status).toBe(400);
    });

    it('should return valid result for loudness', async (t) => {

        // Test file from https://tech.ebu.ch/publications/ebu_loudness_test_set
        const AUDIO_TEST_FILE = 'seq-3341-13-1-24bit.wav'; 
        const res = await request(server).get(`/api/loudness?file=tests/${AUDIO_TEST_FILE}`);
        expect(res.status).toBe(200);

    }, { timeout: 10000 });


    // TODO: test caching on shares
    // TODO: test sample rate
    // TODO: test multiple shares
    // TODO: test url download - create static server to serve the same file over http
});
