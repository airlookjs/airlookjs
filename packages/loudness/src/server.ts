import express from 'express';
import cors from 'cors';
//import prometheus from 'prom-client';
import { config } from './config.js';
import { errorRequestHandler, loudnessRequestHandler } from './route.js';

export const server = express();
// TODO: prometheus
//const collectDefaultMetrics = prometheus.collectDefaultMetrics;
// Probe every 10th second.
// collectDefaultMetrics({ timeout: 10000 });
server.use(cors());
// eslint-disable-next-line no-unused-vars
server.get(`${config.route}`,loudnessRequestHandler);

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
  res.send('Loudness scanner is running');
});

// TODO: prometheus
/*server.get('/metrics', function (_req, res) {
  res.send(prometheus.register.metrics());
});*/

// Fallthrough error handler
server.use(errorRequestHandler);
