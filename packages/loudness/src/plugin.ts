import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { DEFAULT_SAMPLE_RATE, CACHE_DIR, defaultConfig } from './config.js';

import { routes, LoudnessRoutesOptions} from './routes.js';

const plugin: FastifyPluginAsync<Partial<LoudnessRoutesOptions>> = async (fastify, _options) => {

  const options : LoudnessRoutesOptions = {
    sampleRate: DEFAULT_SAMPLE_RATE,
    shares: [],
    prefix: defaultConfig.routePrefix,
    cacheDir: CACHE_DIR,
    ..._options
  }

  fastify.register(routes, options)

}

export default fp(plugin, '4.x')
