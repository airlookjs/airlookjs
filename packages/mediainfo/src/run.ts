import { build } from "./app.js";
import { PORT, config } from "./config.js";
import { MEDIAINFO_CMD, mediainfoVersion } from "./mediainfo.js";

const server = await build(config);

const version = await mediainfoVersion();
console.log(`Starting mediainfo service...`)
console.log(`$ ${MEDIAINFO_CMD} --version\n${version}`);

server.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
