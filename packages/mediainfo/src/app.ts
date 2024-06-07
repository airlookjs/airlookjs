import { config, type MediainfoConfig } from './config.js';
import plugin from './plugin.js';
import { getBuildFunction } from '@airlookjs/shared';

export const build = getBuildFunction<LoudnessConfig>(async (app, c) => {
    await app.register(plugin, {
      prefix: c.routePrefix,
      shares: c.shares,
      ...c.mediainfo
    })
}, config);
