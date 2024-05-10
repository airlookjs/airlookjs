import { server } from '../src/server.js';
import request from "supertest";

// TODO: share matches and cached

// mock configuration
jest.mock('../src/config.js', () => ({
    config: {
        port: 8080,
        route: '/api/loudness',
        shares: [
            {
                name: 'test',
                mount: '/test'
            }
        ]
    }
}));

describe('GET /', () => {
    it('should return 200 OK', async () => {
        const res = await request(server).get('/');
        expect(res.status).toBe(200);
    });
});

describe('GET /api/loudness', () => {

    xit('should return 400 Bad Request with malformed query params', async () => {
        const res = await request(server).get('/api/loudness');
        console.log(res);
        expect(res.status).toBe(400);
    });

    it('should return valid result for loudness', async () => {
        // Test file from https://tech.ebu.ch/publications/ebu_loudness_test_set
        const AUDIO_TEST_FILE = 'seq-3341-13-1-24bit.wav'; 
        const res = await request(server).get(`/api/loudness?file=test/${AUDIO_TEST_FILE}`);
        expect(res.status).toBe(200);


    });


    // TODO: test caching on shares
    // TODO: test sample rate
    // TODO: test multiple shares

    // TODO: test url download - create static server to serve the same file over http
    
});
