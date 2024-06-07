//import { defaultConfig, type LoudnessConfig } from './config.js';
//import loudnessPlugin from './plugin.js';
import type { FastifyRateLimitOptions } from '@fastify/rate-limit';
import type { FastifyCorsOptions } from '@fastify/cors';
import fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import type { ShareInfo } from '../shares';

export interface CommonServiceConfig {
  routePrefix: string;
  shares: ShareInfo[];
  rateLimit?: FastifyRateLimitOptions;
  cors?: FastifyCorsOptions;
  cacheDir?: string;
}

const defaultConfig: CommonServiceConfig = {
  routePrefix: '/api',
  shares: [],
  rateLimit: {
    max: 50,
    timeWindow: '1 minute'
  },
  cors: {
    origin: '*'
  }
};

export const getBuildFunction = <Config extends CommonServiceConfig>(register:(app: FastifyInstance, config: Config) => Promise<void>, defaults: Partial<Config>) => {

  // FIXME: if Config has values not in defaults they should not be optional
  return async (config: Partial<Config>,  fastifyOptions: FastifyServerOptions={}): Promise<FastifyInstance> => {

      const app = fastify(fastifyOptions);
      const c = { ...defaultConfig, ...defaults, ...config };

      if(c.rateLimit) {
        await app.register(import('@fastify/rate-limit'), c.rateLimit)
      }

      if(c.cors) {
        await app.register(import('@fastify/cors'), c.cors)
      }

      // TODO: opentelemetry
      // TODO: prometheus

      await register(app, c as Config);

      return app;
  }
}
