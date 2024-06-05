import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { DEFAULT_SAMPLE_RATE, CACHE_DIR, defaultConfig } from './config.js';

import { routes, LoudnessRoutesOptions} from './routes.js';

const plugin: FastifyPluginCallback<Partial<LoudnessRoutesOptions>> = (fastify, _options, done) => {

  const options : LoudnessRoutesOptions = {
    sampleRate: DEFAULT_SAMPLE_RATE,
    shares: [],
    prefix: defaultConfig.routePrefix,
    cacheDir: CACHE_DIR,
    ..._options
  }

  void fastify.register(routes, options)

  done()
}

export default fp(plugin, '4.x')
