//import express, { type Express } from "express";
//import cors from 'cors';
//import prometheus from 'prom-client';
import { defaultConfig, type LoudnessConfig } from './config.js';
import plugin from './plugin.js';

import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'

export const build = async (config?: Partial<LoudnessConfig>, fastifyOptions: FastifyServerOptions={}): Promise<FastifyInstance> => {

    const app = fastify(fastifyOptions);
    const c = { ...defaultConfig, ...config };

    if(c.rateLimit) {
      await app.register(import('@fastify/rate-limit'), c.rateLimit)
    }

    if(c.cors) {
      await app.register(import('@fastify/cors'), c.cors)
    }
    // cors options
    // opentelemetry option
    // prometheus option

    await app.register(plugin, {
      prefix: c.routePrefix,
      shares: c.shares
    })

    return app;
}
