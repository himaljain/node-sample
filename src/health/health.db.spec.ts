import { ISQLHelper, ISQLHelperToken, SQLHelper } from "@ttx/ttx-db-mssql-helper";
import { ITTXLogger, TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import "reflect-metadata";

import { container } from "../inversify.config";
import { IHealthDB, IHealthDBToken } from "./health.db.interface";

describe("Health DB Unit Tests", () => {
    let sqlHelper: ISQLHelper;
    let healthDB: IHealthDB;
    const logger = TTXExpressLoggerFactory.getLogger();

    beforeEach((done) => {
        container.snapshot();
        done();
    });

    afterEach((done) => {
        healthDB = null;
        sqlHelper = null;
        container.restore();
        done();
    });

    it("checkDBConnection Test Success", (done) => {
        const date = new Date();
        sqlHelper = {
            configure: (txtLogger?: ITTXLogger, config?: any): void => { return; },
            executeSqlQuery: (query) => {
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        recordset: [{ date }],
                    });
                });
            },
            executeStoredProc: (storeProcName: string) => {
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        recordset: [{ date }],
                    });
                });
            },
        };

        container.rebind<ISQLHelper>(ISQLHelperToken).toConstantValue(sqlHelper);
        healthDB = container.get<IHealthDB>(IHealthDBToken);
        healthDB.checkDBConnection().then((result) => {
            expect(result.recordset[0].date).toBe(date);
            done();
        }, (reason) => {
            logger.error(reason);
            expect(true).toBe(false);
            done();
        });

    });

    it("checkDBConnection Test Failure", (done) => {
        const date = new Date();
        sqlHelper = {
            configure: (txtLogger?: ITTXLogger, config?: any): void => { return; },
            executeSqlQuery: (query) => {
                return new Promise<any>((resolve, reject) => {
                    throw new Error("Throwing a dummy error.");
                });
            },
            executeStoredProc: (storeProcName: string) => {
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        recordset: [{ date }],
                    });
                });
            },
        };

        container.rebind<ISQLHelper>(ISQLHelperToken).toConstantValue(sqlHelper);
        healthDB = container.get<IHealthDB>(IHealthDBToken);
        healthDB.checkDBConnection().then((result) => {
            expect(result.recordset[0].date).toBe(date);
            done();
        }).catch((error) => {

            logger.error("Got Error as expected", error);
            expect(true).toBe(true);
            done();

        });

    });
});
