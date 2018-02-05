import { ITTXLogger, TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import * as http from "http";
import "reflect-metadata";
import { App, AppToken } from "./app";
import { container } from "./inversify.config";

export class Server {
    private port: number;
    private isHttps: boolean;
    private logger: ITTXLogger;

    constructor(port: number, isHttps: boolean = false) {
        this.port = port;
        this.isHttps = isHttps;
        this.logger = TTXExpressLoggerFactory.getLogger();
    }

    public start() {
        const app = container.get<App>(AppToken);
        const httpServer = http.createServer(app.expressApp);
        httpServer.listen(this.port);
        httpServer.on("error", (err) => {
            this.logger.error("An Unhandled error has occured", err.message);
        });
        httpServer.on("listening", () => {
            const bind = typeof this.port === "string"
                ? "Pipe " + this.port
                : "Port " + this.port;
            this.logger.info("Listening on " + bind);
        });
    }
}
