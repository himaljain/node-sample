import { ITTXLogger, TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import { IUserPrincipal } from "@ttx/ttx-security-express";
import { Request, Response } from "express";
import "reflect-metadata";
import { container } from "../inversify.config";
import { ICouchbaseSampleController, ICouchbaseSampleControllerToken } from "./couchbase-sample.controller.interface";

import { CouchbaseSampleDB } from "./couchbase-sample.db";
import { ICouchbaseSampleDB, ICouchbaseSampleDBToken } from "./couchbase-sample.db.interface";

describe("Couchbase Sample Controller Unit Tests", () => {
    let res: any;
    let req: any;
    let controller: ICouchbaseSampleController;
    let db: any;
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
        controller = null;
        db = null;
        res = null;
        req = null;
        container.restore();
        done();
    });

    it("readiness success", (done) => {
        const date = new Date();
        db = {
            configure: (ttxLogger?: ITTXLogger, user?: IUserPrincipal, config?: any): void => { return; },
            getWorkqueue: () => {
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        recordset: [{ date }],
                    });
                });
            },
        };
        container.rebind<ICouchbaseSampleDB>(ICouchbaseSampleDBToken).toConstantValue(db);
        controller = container.get<ICouchbaseSampleController>(ICouchbaseSampleControllerToken);
        controller.get(req, res)
            .then(() => {
                expect(res.json).toHaveBeenCalled();
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
        db = {
            configure: (ttxLogger?: ITTXLogger, user?: IUserPrincipal, config?: any): void => { return; },
            getWorkqueue: () => {
                return new Promise<any>((resolve, reject) => {
                    reject("Throwing a dummy error");
                });
            },
        };
        container.rebind<ICouchbaseSampleDB>(ICouchbaseSampleDBToken).toConstantValue(db);
        controller = container.get<ICouchbaseSampleController>(ICouchbaseSampleControllerToken);
        controller.get(req, res)
            .then(() => {
                expect(res.json).not.toHaveBeenCalled();
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
