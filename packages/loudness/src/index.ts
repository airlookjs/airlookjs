export { build } from './app.js';
export { defaultConfig, type LoudnessConfig } from './config.js';
import plugin from './plugin.js';
export { plugin as fastifyLoudnessPlugin};
export { getLoudness } from './loudness.js';

//import child_process from 'child_process';
//import { promisify } from 'util';
//import { LOUDNESS_CMD, config } from './config.js';
//const exec = promisify(child_process.execFile)
/*
console.log("Starting loudness scanner service...")
const out = await exec(LOUDNESS_CMD, ["--version"])
//if (stderr) console.error('stderr', stderr)
console.log(`$ ${LOUDNESS_CMD} --version\n${out.stdout}`);

server.listen(config.port, function () {
  console.log(`listening on http://127.0.0.1:${config.port}`);
});*/
