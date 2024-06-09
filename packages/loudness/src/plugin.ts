import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { config } from './config.js';

import { routes, LoudnessRoutesOptions} from './routes.js';

const plugin: FastifyPluginCallback<Partial<LoudnessRoutesOptions>> = (fastify, _options, done) => {

  const options : LoudnessRoutesOptions = {
    ...config.loudness,
    shares: config.shares,
    prefix: config.routePrefix,
    ..._options
  }

  void fastify.register(routes, options)
  done()

}

export default fp(plugin, '4.x')
