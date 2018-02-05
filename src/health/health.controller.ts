import { TTXExpressLoggerFactory } from "@ttx/ttx-logger-express";
import { Request, Route, RouteSecurity, secureRoute, unsecureRoute } from "@ttx/ttx-security-express";
import { Response } from "express";
import { inject, injectable, interfaces } from "inversify";

import { Activities } from "../activities";
import { InjectionToken } from "../injection-token";
import { container } from "../inversify.config";
import { IHealthController } from "./health.controller.interface";
import { IHealthDB, IHealthDBToken } from "./health.db.interface";

@injectable()
export class HealthController implements IHealthController {

    // As these are handler methods which are called on requests
    // Any injection in constructor will not be available in method at the time of serving request
    // One way is to use Fat Arrow functions, which creates a clouser. See reference below
    // https://github.com/Microsoft/TypeScript/wiki/%27this%27-in-TypeScript
    // Injecting constructors will make this state full.
    // To avoid statefull we will instantiate dependencies whereever required.
    // constructor() {
    // }

    @unsecureRoute(new Route("get", "/liveness"))
    public async liveness(req: Request, res: Response): Promise<any> {
        res.status(204).send();
    }

    @unsecureRoute(new Route("get", "/readiness"))
    public async readiness(req: Request, res: Response): Promise<any> {
        const logger = TTXExpressLoggerFactory.getLoggerFromRequest(req);
        const dbFactory: interfaces.Factory<IHealthDB> = container.get<interfaces.Factory<IHealthDB>>(InjectionToken.DBFactoryToken);
        const db: IHealthDB = dbFactory(IHealthDBToken, req.user, logger) as IHealthDB;
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
}
