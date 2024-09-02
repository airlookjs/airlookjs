//import { defaultConfig, type LoudnessConfig } from './config.js';
//import loudnessPlugin from './plugin.js';
import type { FastifyRateLimitOptions } from '@fastify/rate-limit';
import type { FastifyCorsOptions } from '@fastify/cors';
import type { FastifyInstance, FastifyServerOptions } from 'fastify';
import type { ShareInfo } from '../shares.js';
import fastify from 'fastify'

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

export type ServiceBuildFunction<Config extends CommonServiceConfig> = (config: Partial<Config>, fastifyOptions?: FastifyServerOptions) => Promise<FastifyInstance>;

export const getBuildFunction = <Config extends CommonServiceConfig>(register:(app: FastifyInstance, config: Config) => Promise<void>, defaults: Partial<Config>) : ServiceBuildFunction<Config> => {

  // FIXME: if Config has values not in defaults they should not be optional

  const build : ServiceBuildFunction<Config> = async (config, fastifyOptions={}) => {
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
  };

  return build;

}
