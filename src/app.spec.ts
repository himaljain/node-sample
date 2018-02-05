import { ISecurityProvider, ISecurityProviderToken, SecurityProviderOptions } from "@ttx/ttx-security-express";
import { Application, Handler } from "express";
import { Container } from "inversify";
import "reflect-metadata";

import { App, AppToken } from "./app";
import { InjectionToken } from "./injection-token";
import { container } from "./inversify.config";

describe("App Unit Tests", () => {
    let expressApp: any;
    let securityProvider: ISecurityProvider;

    beforeEach((done) => {
        // container.snapshot();
        expressApp = {
            use: () => { return; },
        };
        spyOn(expressApp, "use");

        securityProvider = {
            initialize: (options?: SecurityProviderOptions): Handler[] => {
                return [];
            },
        };
        spyOn(securityProvider, "initialize");
        container.rebind<Application>(InjectionToken.ExpressApplicationToken).toConstantValue(expressApp);
        // container.rebind<ISecurityProvider>(ISecurityProviderToken).toConstantValue(securityProvider);
        done();
    });

    afterEach((done) => {
        // container.restore();
        done();
    });

    it("App is initalized", (done) => {
        const app = container.get<App>(AppToken);
        // expect(expressApp.use).toHaveBeenCalledTimes(5);
        // expect(securityProvider.initialize).toHaveBeenCalledWith();
        done();
    });
});
