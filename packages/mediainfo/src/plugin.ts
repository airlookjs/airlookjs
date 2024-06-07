import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { config } from './config.js';

import { routes, MediainfoRoutesOptions} from './routes.js';

const plugin: FastifyPluginCallback<Partial<MediainfoRoutesOptions>> = (fastify, _options, done) => {

  const options : MediainfoRoutesOptions = {
    ...config.mediainfo,
    shares: config.shares,
    prefix: config.routePrefix,
    ..._options
  }

  void fastify.register(routes, options)
  done()

}

export default fp(plugin, '4.x')
