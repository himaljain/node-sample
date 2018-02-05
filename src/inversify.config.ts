import { CRBAuthorizationServiceFactory } from "@ttx/crb-security-express";
import { IDBBase } from "@ttx/ttx-db-base";
import {
    CouchbaseConfigToken,
    CouchbaseHelper,
    ICouchbaseConfig,
    ICouchbaseHelper,
    ICouchbaseHelperToken,
} from "@ttx/ttx-db-couchbase-helper";
import {
    ConnectionStringNameToken,
    ISQLHelper, ISQLHelperParam, ISQLHelperParamToken, ISQLHelperToken,
    SQLHelper, SQLHelperParam,
} from "@ttx/ttx-db-mssql-helper";
import { ITTXLogger } from "@ttx/ttx-logger-express";
import {
    IAuthorizationServiceFactory,
    IAuthorizationServiceFactoryToken,
    IUserPrincipal,
} from "@ttx/ttx-security-core";
import { ISecurityProvider, ISecurityProviderToken, SecurityProvider } from "@ttx/ttx-security-express";
import * as express from "express";
import { Container, interfaces } from "inversify";
import "reflect-metadata";

import { App, AppToken } from "./app";
import { AppConfig } from "./app-config";
import { CouchbaseSampleController } from "./couchbase-sample/couchbase-sample.controller";
import { ICouchbaseSampleController, ICouchbaseSampleControllerToken } from "./couchbase-sample/couchbase-sample.controller.interface";
import { CouchbaseSampleDB } from "./couchbase-sample/couchbase-sample.db";
import { ICouchbaseSampleDB, ICouchbaseSampleDBToken } from "./couchbase-sample/couchbase-sample.db.interface";
import { HealthController } from "./health/health.controller";
import { IHealthController, IHealthControllerToken } from "./health/health.controller.interface";
import { HealthDB } from "./health/health.db";
import { IHealthDB, IHealthDBToken } from "./health/health.db.interface";
import { InjectionToken } from "./injection-token";
import { SQLSampleController } from "./sql-sample/sql-sample.controller";
import { ISQLSampleController, ISQLSampleControllerToken } from "./sql-sample/sql-sample.controller.interface";
import { SQLSampleDB } from "./sql-sample/sql-sample.db";
import { ISQLSampleDB, ISQLSampleDBToken } from "./sql-sample/sql-sample.db.interface";

const container = new Container();

// express
container.bind<express.Application>(InjectionToken.ExpressApplicationToken)
    .toDynamicValue((context: interfaces.Context) => {
        return express();
    });

// app
container.bind<App>(AppToken).to(App);

// health
container.bind<IHealthController>(IHealthControllerToken).to(HealthController);
container.bind<IHealthDB>(IHealthDBToken).to(HealthDB);

// sql-sample
container.bind<ISQLSampleController>(ISQLSampleControllerToken).to(SQLSampleController);
container.bind<ISQLSampleDB>(ISQLSampleDBToken).to(SQLSampleDB);

// sql helper
container.bind<string>(ConnectionStringNameToken).toConstantValue(AppConfig.connectionStringName);
container.bind<ISQLHelper>(ISQLHelperToken).to(SQLHelper);
container.bind<interfaces.Newable<ISQLHelperParam>>(ISQLHelperParamToken)
    .toConstructor<ISQLHelperParam>(SQLHelperParam);

// db factory
container.bind<interfaces.Factory<IDBBase>>(InjectionToken.DBFactoryToken)
    .toFactory<IDBBase>((context: interfaces.Context) => {
        return (token: string | symbol, user: IUserPrincipal, logger: ITTXLogger) => {
            const db = context.container.get<IDBBase>(token);
            const config = context.container.get<string>(ConnectionStringNameToken);
            db.configure(logger, user, config);
            return db;
        };
    });

// couchbase-sample
container.bind<ICouchbaseSampleController>(ICouchbaseSampleControllerToken).to(CouchbaseSampleController);
container.bind<ICouchbaseSampleDB>(ICouchbaseSampleDBToken).to(CouchbaseSampleDB);

// couchbase helper
container.bind<ICouchbaseConfig>(CouchbaseConfigToken).toConstantValue({
    bucketName: AppConfig.couchbaseBucket,
    clusterEndPoint: AppConfig.couchbaseClusterEndPoint,
});
container.bind<ICouchbaseHelper>(ICouchbaseHelperToken).to(CouchbaseHelper);

// couchbase db factory
container.bind<interfaces.Factory<IDBBase>>(InjectionToken.CouchbaseDBFactoryToken)
    .toFactory<IDBBase>((context: interfaces.Context) => {
        return (token: string | symbol, user: IUserPrincipal, logger: ITTXLogger) => {
            const db = context.container.get<IDBBase>(token);
            const config = context.container.get<ICouchbaseConfig>(CouchbaseConfigToken);
            db.configure(logger, user, config);
            return db;
        };
    });

// security
container.bind<ISecurityProvider>(ISecurityProviderToken).to(SecurityProvider);
container.bind<IAuthorizationServiceFactory>(IAuthorizationServiceFactoryToken).to(CRBAuthorizationServiceFactory);

export { container };
