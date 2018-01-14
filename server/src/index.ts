import * as http from "http";
import * as WebSocket from 'ws';

import Server from "./app"

import { normalizePort } from "./utils";

const app = new Server();
const exp = app.express;

const port = normalizePort(process.env.PORT || 3000);

const server = http.createServer(exp);
const wss = new WebSocket.Server({ server: server });
app.registerWS(wss);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);


function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') throw error;
  let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
  switch(error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening(): void {
  let addr = server.address();
  let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
}
