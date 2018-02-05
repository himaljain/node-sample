import { Server } from "./server";
import { ServerConfig } from "./server-config";

const server = new Server(ServerConfig.port, ServerConfig.isHttps);
server.start();
