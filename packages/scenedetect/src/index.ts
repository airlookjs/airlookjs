import os from 'os';
import express from 'express';
import cors from 'cors';
import prometheus from 'prom-client';
import { errorRequestHandler, scenedetectRequestHandler } from './route.js';

import { config } from './config.js';

const server = express();

// const collectDefaultMetrics = prometheus.collectDefaultMetrics;
// Probe every 10th second.
// collectDefaultMetrics({ timeout: 10000 });

const HOSTNAME = os.hostname();

server.use(cors());

server.get(`${config.route}`, scenedetectRequestHandler);

/*
const checks = 
    config.shares.map(share => {
        return {
            name: `Connection to ${share.name} Storage`,
            description: `Is directory readable at ${share.mount}`,
            checkFn: function() {
                if (!fs.existsSync(share.mount)) {
                    throw new Error(`${share.name} storage share at ${share.mount} could not be accessed.`)
                }
            }
        }
    });

server.use('/status', getExpressHealthRoute(checks));
*/

server.get('/', function (_req, res) {
	res.send('Scene detection is running');
});

server.get('/metrics', function (_req, res) {
	res.send(prometheus.register.metrics());
});

// Fallthrough error handler
server.use(errorRequestHandler);

server.listen(config.port, function () {
	console.log(`Scene detection listening on ${HOSTNAME}:${config.port}`);
});
