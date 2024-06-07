//import express, { type Express } from "express";
//import cors from 'cors';
//import prometheus from 'prom-client';
import { config, type LoudnessConfig } from './config.js';
import plugin from './plugin.js';
import { getBuildFunction } from '@airlookjs/shared';

export const build = getBuildFunction<LoudnessConfig>(async (app, c) => {
    await app.register(plugin, {
      prefix: c.routePrefix,
      shares: c.shares,
      ...c.loudness
    })
}, config);
