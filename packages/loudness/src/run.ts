import { build } from "./app.js";
import { PORT } from "./config.js";
import { LOUDNESS_CMD, loudnessVersion } from "./loudness.js";

const server = await build();

const version = await loudnessVersion();
console.log(`Starting loudness scanner service...`)
console.log(`$ ${LOUDNESS_CMD} --version\n${version}`);

server.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
