import { build } from "./app.js";
import { PORT, config } from "./config.js";
import { SCENEDETECT_CMD, scenedetectVersion } from "./scenedetect.js";

const server = await build(config);

const version = await scenedetectVersion();
console.log(`Starting scenedetect service...`)
console.log(`$ ${SCENEDETECT_CMD} version\n${version}`);

// FIXME: typescript build, not lint complains about the callback not being typed, but it should be inferred from fastify, adding the same type manually to silence the error
server.listen({ port: PORT }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
