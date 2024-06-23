import { createServer } from 'node:http';

import { getPort } from 'get-port-please';
import 'reflect-metadata';

import { MainApplication } from './app';

async function main() {
  try {
    const main = new MainApplication();
    const server = createServer(main.toNodeHandler());

    const port = await getPort();

    server.listen(port, () => {
      console.log('Listen on port: http://localhost:%d', port);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
