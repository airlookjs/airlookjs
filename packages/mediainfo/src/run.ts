import { build } from "./app.js";
import { PORT, config } from "./config.js";
import { MEDIAINFO_CMD, mediainfoVersion } from "./mediainfo.js";

const server = await build(config);

const version = await mediainfoVersion();
console.log(`Starting mediainfo service...`)
console.log(`$ ${MEDIAINFO_CMD} --version\n${version}`);

// FIXME: typescript build, not lint complains about the callback not being typed, but it should be inferred from fastify, adding the same type manually to silence the error
server.listen({ port: PORT }, (err: Error | null, address: string) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
