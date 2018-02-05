import { ITTXLogger, TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import { IUserPrincipal } from "@ttx/ttx-security-express";
import { Request, Response } from "express";
import { Container } from "inversify";
import "reflect-metadata";

import { container } from "../inversify.config";
import { HealthController } from "./health.controller";
import { IHealthController, IHealthControllerToken } from "./health.controller.interface";
import { HealthDB } from "./health.db";
import { IHealthDB, IHealthDBToken } from "./health.db.interface";

describe("Health Controller Unit Tests", () => {
    let healthController: IHealthController;
    let healthDB: any;
    let res: any;
    let req: any;
    const logger = TTXExpressLoggerFactory.getLogger();

    beforeEach((done) => {
        res = {
            json: (value: any) => { return; },
            result: null,
            send: () => { return; },
            status: (code: any) => { return; },
            statusCode: null,
        };

        req = { query: {} };

        spyOn(res, "status").and.callFake((code: any) => {
            res.statusCode = code;
            return res;
        });
        spyOn(res, "send");
        spyOn(res, "json").and.callFake((value: any) => {
            res.result = value;
            return res;
        });
        container.snapshot();
        done();
    });

    afterEach((done) => {
        healthController = null;
        healthDB = null;
        res = null;
        req = null;
        container.restore();
        done();
    });

    it("liveness to respond with 204", (done) => {
        healthController = container.get<IHealthController>(IHealthControllerToken);
        healthController.liveness(req, res);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
        done();
    });

    it("readiness success", (done) => {
        const date = new Date();
        healthDB = {
            checkDBConnection: () => {
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        recordset: [{ date }],
                    });
                });
            },
            configure: (ttxLogger?: ITTXLogger, user?: IUserPrincipal, config?: any): void => { return; },
        };
        container.rebind<IHealthDB>(IHealthDBToken).toConstantValue(healthDB);
        healthController = container.get<IHealthController>(IHealthControllerToken);
        healthController.readiness(req, res)
            .then(() => {
                expect(res.json).toHaveBeenCalled();
                expect(res.result[0].checkDbConnection).toBe("successful");
                expect(res.status).not.toHaveBeenCalled();
                done();
            }, (error) => {
                logger.error(error);
                expect(true).toBe(false);
                done();
            });
    });

    it("readiness failure", (done) => {
        const date = new Date();
        healthDB = {
            checkDBConnection: () => {
                return new Promise<any>((resolve, reject) => {
                    reject("Throwing a dummy error");
                });
            },
            configure: (ttxLogger?: ITTXLogger, user?: IUserPrincipal, config?: any): void => { return; },
        };
        container.rebind<IHealthDB>(IHealthDBToken).toConstantValue(healthDB);
        healthController = container.get<IHealthController>(IHealthControllerToken);
        healthController.readiness(req, res)
            .then(() => {
                expect(res.json).toHaveBeenCalled();
                expect(res.result[0].checkDbConnection).toBe("failure");
                expect(res.status).toHaveBeenCalled();
                expect(res.statusCode).toBe(500);
                done();
            }, (reason) => {
                logger.error(reason);
                expect(true).toBe(false);
                done();
            });
    });
});
