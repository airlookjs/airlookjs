import { server } from '../src/index.js';
import request from "supertest";


describe('GET /api/loudness', () => {
    xit('should return 400 Bad Request', async () => {
        const res = await request(server).get('/api/loudness');
        console.log(res);
        expect(res.status).toBe(400);
    });

    xit('should return 200 OK', async () => {
        const res = await request(server).get('/api/loudness?file=foo');
        expect(res.status).toBe(200);
    });

    
});
