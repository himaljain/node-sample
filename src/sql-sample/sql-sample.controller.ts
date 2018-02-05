import { ContextSecurityType, CRBRouteSecurity, crbSecureRoute } from "@ttx/crb-security-express";
import { IDBBase } from "@ttx/ttx-db-base";
import { TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import { Request, Route, RouteSecurity, secureRoute, unsecureRoute } from "@ttx/ttx-security-express";
import { NextFunction, Response } from "express";
import { inject, injectable, interfaces } from "inversify";

import { Activities } from "../activities";
import { InjectionToken } from "../injection-token";
import { container } from "../inversify.config";
import { ISQLSampleController } from "./sql-sample.controller.interface";
import { ISQLSampleDB, ISQLSampleDBToken } from "./sql-sample.db.interface";

@injectable()
export class SQLSampleController implements ISQLSampleController {

    private static async sampleMiddleware(req: Request, res: Response, next: NextFunction) {
        const logger = TTXExpressLoggerFactory.getLoggerFromRequest(req);
        logger.info("This is a custom middleware");
        next();
    }

    @secureRoute(new Route("get", "/liveness"))
    @unsecureRoute(new Route("get", "/liveness/unsecure"))
    public async liveness(req: Request, res: Response) {
        let logger = TTXExpressLoggerFactory.getLogger();
        logger.info("This is just a sample logging message without request context.");
        logger = TTXExpressLoggerFactory.getLoggerFromRequest(req);
        logger.info("This is just a sample logging message with request context.");
        logger.info("Different messages can be correlated.");
        res.status(204).send();
    }

    // In Below route middleware will be called twice, middleware is an ...[] and multiples can be applied.
    @unsecureRoute(new Route("get", "/readiness/unsecure", SQLSampleController.sampleMiddleware,
        SQLSampleController.sampleMiddleware))
    // In Below route middleware will not be called, as Security is the first thing which is applied.
    @secureRoute(new Route("get", "/readiness1", SQLSampleController.sampleMiddleware), new RouteSecurity(Activities.Dummy))
    @secureRoute(new Route("get", "/readiness"), new RouteSecurity(Activities.PriceMasterRead))
    public async readiness(req: Request, res: Response) {
        debugger;
        const logger = TTXExpressLoggerFactory.getLoggerFromRequest(req);
        const dbFactory: interfaces.Factory<IDBBase> = container.get<interfaces.Factory<IDBBase>>(InjectionToken.DBFactoryToken);
        const db: ISQLSampleDB = dbFactory(ISQLSampleDBToken, req.user, logger) as ISQLSampleDB;
        const diagnosticResults = [];
        try {
            const result = await db.checkDBConnection();
            diagnosticResults.push({ checkDbConnection: "successful", date: result.recordset[0].date });
            res.json(diagnosticResults);
        } catch (error) {
            logger.error(error);
            diagnosticResults.push({ checkDbConnection: "failure" });
            res.status(500).json(diagnosticResults);
        }
    }

    @crbSecureRoute(new Route("put", "/ShopAuditing/:client/:facility/runWithContextSecurity"),
        new CRBRouteSecurity([Activities.InitiateShopAuditingException], ContextSecurityType.ClientAndFacility))
    // By default ContextSecurityType is set to None, which will not check any context specific Authorization
    // So below two attributes are achieving the same
    @crbSecureRoute(new Route("put", "/ShopAuditing/:client/:facility/runWithoutContextSecurity"),
        new CRBRouteSecurity([Activities.InitiateShopAuditingException]))
    @secureRoute(new Route("put", "/ShopAuditing/:client/:facility/runWithoutContextSecurity1"),
        new RouteSecurity(Activities.InitiateShopAuditingException))
    public async initiateAuditMonth(req: Request, res: Response) {
        const logger = TTXExpressLoggerFactory.getLoggerFromRequest(req);
        // req.user.isAuthorizedForContext can be used to evaluate for specific context within controller or in db.
        const client = req.params.client;
        const facility = req.params.facility;
        let result = await req.user.isAuthorizedForContext(Activities.InitiateShopAuditingException, {
            client,
            facilities: [facility],
        });
        logger.info(result.toString());
        result = await req.user.isAuthorizedForContext(Activities.InitiateShopAuditingException, {
            client: "TTX",
            facilities: ["Dummy"],
        });
        logger.info(result.toString());

        // If multiple sub context are supplied, all must evaluate to true.
        // Hopefully this would never be used.
        result = await req.user.isAuthorizedForContext(Activities.InitiateShopAuditingException, {
            client,
            facilities: [facility, "Dummy"],
        });
        logger.info(result.toString());
        logger.info("Shop Run Initiated");
        res.status(200).send("Success");
    }
}
