import { config } from './config.js'
import { server } from './server.js'

console.log("Starting SceneDetect service...")

server.listen(config.port, () => {
	console.log(`SceneDetect ${config.version} server listening on http://127.0.0.1:${config.port}`)
})
