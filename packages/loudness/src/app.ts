//import express, { type Express } from "express";
//import cors from 'cors';
//import prometheus from 'prom-client';
import { defaultConfig, type LoudnessConfig } from './config.js';
import loudnessPlugin from './plugin.js';
//import { LOUDNESS_CMD, loudnessVersion } from './loudness.js';

//export const server : Express = express();
// TODO: prometheus
//const collectDefaultMetrics = prometheus.collectDefaultMetrics;
// Probe every 10th second.
// collectDefaultMetrics({ timeout: 10000 });
//server.use(cors());
//server.get(`${config.route}`,loudnessRequestHandler);
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
/*server.get('/', function (_req, res) {
  res.send('Loudness scanner is running');
});*/

// TODO: prometheus
/*server.get('/metrics', function (_req, res) {
  res.send(prometheus.register.metrics());
});*/

// Fallthrough error handler
//server.use(errorRequestHandler);

import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'

export const build = (config?: Partial<LoudnessConfig>, fastifyOptions: FastifyServerOptions={}): FastifyInstance => {
    const app = fastify(fastifyOptions);
    const c = { ...defaultConfig, ...config };

    // cors options
    // opentelemetry option
    // prometheus option


    void app.register(loudnessPlugin, {
      prefix: c.routePrefix,
      shares: c.shares
    })

    return app;
}
