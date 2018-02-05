import { ITTXLogger, TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import { IUserPrincipal } from "@ttx/ttx-security-express";
import { Request, Response } from "express";
import "reflect-metadata";
import { container } from "../inversify.config";
import { ISQLSampleController, ISQLSampleControllerToken } from "./sql-sample.controller.interface";

import { SQLSampleDB } from "./sql-sample.db";
import { ISQLSampleDB, ISQLSampleDBToken } from "./sql-sample.db.interface";

describe("SQL Sample Controller Unit Tests", () => {
    let res: any;
    let req: any;
    let sqlSampleController: ISQLSampleController;
    let sqlSampleDB: any;
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
        sqlSampleController = null;
        sqlSampleDB = null;
        res = null;
        req = null;
        container.restore();
        done();
    });

    it("liveness to respond with 204", (done) => {
        sqlSampleController = container.get<ISQLSampleController>(ISQLSampleControllerToken);
        sqlSampleController.liveness(req, res);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
        done();
    });

    it("readiness success", (done) => {
        const date = new Date();
        sqlSampleDB = {
            checkDBConnection: () => {
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        recordset: [{ date }],
                    });
                });
            },
            configure: (txtLogger?: ITTXLogger, user?: IUserPrincipal, config?: any): void => { return; },
        };
        container.rebind<ISQLSampleDB>(ISQLSampleDBToken).toConstantValue(sqlSampleDB);
        sqlSampleController = container.get<ISQLSampleController>(ISQLSampleControllerToken);
        sqlSampleController.readiness(req, res)
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
        sqlSampleDB = {
            checkDBConnection: () => {
                return new Promise<any>((resolve, reject) => {
                    reject("Throwing a dummy error");
                });
            },
            configure: (txtLogger?: ITTXLogger, user?: IUserPrincipal, config?: any): void => { return; },
        };
        container.rebind<ISQLSampleDB>(ISQLSampleDBToken).toConstantValue(sqlSampleDB);
        sqlSampleController = container.get<ISQLSampleController>(ISQLSampleControllerToken);
        sqlSampleController.readiness(req, res)
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
