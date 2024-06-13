import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { config } from './config.js';

import { routes, type ScenedetectRoutesOptions} from './routes.js';

const plugin: FastifyPluginCallback<Partial<ScenedetectRoutesOptions>> = (fastify, _options, done) => {

  const options : ScenedetectRoutesOptions = {
    ...config.scenedetect,
    shares: config.shares,
    prefix: config.routePrefix,
    ..._options
  }
  void fastify.register(routes, options)
  done()

}

export default fp(plugin, '4.x')
