import type { LoudnessConfig } from './config.js';
import { config } from './config.js';
import plugin from './plugin.js';
import { getBuildFunction } from '@airlookjs/shared';

export const build = getBuildFunction<LoudnessConfig>(async (app, c) => {
    await app.register(plugin, {
      prefix: c.routePrefix,
      shares: c.shares,
      ...c.loudness
    })
}, config);
