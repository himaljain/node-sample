import { IDBBase } from "@ttx/ttx-db-base";
import { TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import { Request, Route, RouteSecurity, secureRoute, unsecureRoute } from "@ttx/ttx-security-express";
import { Response } from "express";
import { inject, injectable, interfaces } from "inversify";

import { Activities } from "../activities";
import { InjectionToken } from "../injection-token";
import { container } from "../inversify.config";
import { ICouchbaseSampleController } from "./couchbase-sample.controller.interface";
import { ICouchbaseSampleDB, ICouchbaseSampleDBToken } from "./couchbase-sample.db.interface";

@injectable()
export class CouchbaseSampleController implements ICouchbaseSampleController {

    @secureRoute(new Route("get", "/"), new RouteSecurity(Activities.PriceMasterRead))
    public async get(req: Request, res: Response) {
        const logger = TTXExpressLoggerFactory.getLoggerFromRequest(req);
        const dbFactory: interfaces.Factory<IDBBase> = container.get<interfaces.Factory<IDBBase>>(InjectionToken.CouchbaseDBFactoryToken);
        const db: ICouchbaseSampleDB = dbFactory(ICouchbaseSampleDBToken, req.user, logger) as ICouchbaseSampleDB;
        try {
            const result = await db.getWorkqueue();
            res.json(result);
        } catch (error) {
            logger.error(error);
            res.status(500).send();
        }
    }
}
