export { build } from './app.js';
export { config, type SceneDetectConfig } from './config.js';
import plugin from './plugin.js';
export { plugin as fastifyMediainfoPlugin};
export { getScenes } from './scenedetect.js';


// import { config } from './config.js'
// import { server } from './server.js'

// console.log("Starting SceneDetect service...")

// server.listen(config.port, () => {
// 	console.log(`SceneDetect ${config.version} server listening on http://127.0.0.1:${config.port}`)
// })
