import { ICouchbaseHelper, ICouchbaseHelperToken } from "@ttx/ttx-db-couchbase-helper";
import { ITTXLogger, TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import "reflect-metadata";

import { container } from "../inversify.config";
import { CouchbaseSampleDB } from "./couchbase-sample.db";
import { ICouchbaseSampleDB, ICouchbaseSampleDBToken } from "./couchbase-sample.db.interface";

describe("Couchbase Sample DB Unit Tests", () => {
    let dbHelper: ICouchbaseHelper;
    let db: ICouchbaseSampleDB;
    const logger = TTXExpressLoggerFactory.getLogger();

    beforeEach((done) => {
        container.snapshot();
        dbHelper = {
            configure: (txtLogger?: ITTXLogger, config?: any): void => { return; },
            get: (key, options?) => undefined,
            getMulti: (key) => undefined,
            insert: (key, value, options?) => undefined,
            query: (query, params?) => undefined,
            remove: (key, options) => undefined,
            replace: (key, value, options?) => undefined,
            upsert: (key, value, options?) => undefined,
        };
        done();
    });

    afterEach((done) => {
        dbHelper = null;
        db = null;
        container.restore();
        done();
    });

    it("checkDBConnection Test Success", (done) => {
        const date = new Date();

        dbHelper.query = (query, params?) => {
            return new Promise<any>((resolve, reject) => {
                resolve({
                    records: [{ date }],
                });
            });
        };
        container.rebind<ICouchbaseHelper>(ICouchbaseHelperToken).toConstantValue(dbHelper);
        db = container.get<ICouchbaseSampleDB>(ICouchbaseSampleDBToken);
        db.getWorkqueue().then((result) => {
            expect(result.records[0].date).toBe(date);
            done();
        }, (reason) => {
            logger.error(reason);
            expect(true).toBe(false);
            done();
        });

    });

    it("checkDBConnection Test Failure", (done) => {
        const date = new Date();
        dbHelper.query = (query, params?) => {
            return new Promise<any>((resolve, reject) => {
                throw new Error("Throwing new error.");
            });
        };

        container.rebind<ICouchbaseHelper>(ICouchbaseHelperToken).toConstantValue(dbHelper);
        db = container.get<ICouchbaseSampleDB>(ICouchbaseSampleDBToken);
        db.getWorkqueue().then((result) => {
            expect(result.records[0].date).toBe(date);
            done();
        }).catch((error) => {

            logger.error("Got Error as expected", error);
            expect(true).toBe(true);
            done();

        });

    });
});
