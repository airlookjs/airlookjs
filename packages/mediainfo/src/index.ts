import os from 'os'
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { config } from './config.js'
import { MediaInfoHandler } from './route.js'
// TODO: conditionally enable prometheus
//import prometheus from 'prom-client'

// TODO: opentelemetry

// TODO: optional dir listing for mounted shares

const HOSTNAME = os.hostname()
const server = express()
// const collectDefaultMetrics = prometheus.collectDefaultMetrics
// Probe every 10th second.
// collectDefaultMetrics({ timeout: 10000 })
server.use(express.json())
server.use(cors())
server.get(`${config.route}/:path(*)`, MediaInfoHandler)
server.get('/',  (_req, res) => {
	res.send('MediaInfo is running')
})
// Fallthrough error handler
server.use((err: Error, _req: Request, res: Response) => {
	res.statusCode = 500
	res.json({ error: err.message })
})
server.listen(config.port,  async() => {
	console.log(`MediaInfo ${config.version} server listening on ${HOSTNAME}:${config.port}`)
})
