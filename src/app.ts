import { CRBAuthorizationServiceConfig } from "@ttx/crb-security-express";
import { TTXExpressLoggerFactory, TTXRequestLoggerMiddleware, TTXRequestLoggerOptions } from "@ttx/ttx-logger-express";
import { IAuthorizationServiceFactory, IAuthorizationServiceFactoryToken } from "@ttx/ttx-security-core";
import {
    AuthenticationProviderType,
    getRouter, ISecurityProvider, ISecurityProviderToken,
    SecurityProviderOptions,
} from "@ttx/ttx-security-express";
import * as bodyParser from "body-parser";
import { Application } from "express";
import { inject, injectable } from "inversify";

import { AppConfig } from "./app-config";
import { ICouchbaseSampleController, ICouchbaseSampleControllerToken } from "./couchbase-sample/couchbase-sample.controller.interface";
import { IHealthController, IHealthControllerToken } from "./health/health.controller.interface";
import { InjectionToken } from "./injection-token";
import { ISQLSampleController, ISQLSampleControllerToken } from "./sql-sample/sql-sample.controller.interface";

@injectable()
export class App {
    public expressApp: Application;
    private healthController: IHealthController;
    private couchbaseSampleController: ICouchbaseSampleController;
    private sqlSampleController: ISQLSampleController;
    private securityProvider: ISecurityProvider;
    private authorizationServiceFactory: IAuthorizationServiceFactory;

    constructor(
        @inject(IHealthControllerToken) healthController: IHealthController,
        @inject(ISQLSampleControllerToken) sqlSampleController: ISQLSampleController,
        @inject(ICouchbaseSampleControllerToken) couchbaseSampleController: ICouchbaseSampleController,
        @inject(ISecurityProviderToken) securityProvider: ISecurityProvider,
        @inject(InjectionToken.ExpressApplicationToken) expressApp: Application,
        @inject(IAuthorizationServiceFactoryToken) authorizationServiceFactory: IAuthorizationServiceFactory) {

        this.healthController = healthController;
        this.sqlSampleController = sqlSampleController;
        this.couchbaseSampleController = couchbaseSampleController;
        this.expressApp = expressApp;
        this.securityProvider = securityProvider;
        this.authorizationServiceFactory = authorizationServiceFactory;
        this.configure();
    }

    private configure() {
        this.addGlobalMiddlewares();
        this.configureRoutes();
    }

    private addGlobalMiddlewares() {
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({
            extended: true,
        }));
        TTXExpressLoggerFactory.initialize();
        this.expressApp.use(TTXRequestLoggerMiddleware.create(new TTXRequestLoggerOptions(true, true)));
        const authorizationConfig = new CRBAuthorizationServiceConfig(AppConfig.authorizationServiceURL);
        const securityOptions = new SecurityProviderOptions(AuthenticationProviderType.Default,
            undefined, this.authorizationServiceFactory, authorizationConfig);
        this.expressApp.use(this.securityProvider.initialize(securityOptions));
    }

    private configureRoutes() {
        this.expressApp.use("/health", getRouter(this.healthController));
        this.expressApp.use("/sql-sample", getRouter(this.sqlSampleController));
        this.expressApp.use("/couchbase-sample", getRouter(this.couchbaseSampleController));
    }
}

export const AppToken = Symbol("App");
