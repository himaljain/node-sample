import { Request, Response } from "express";

export interface IHealthController {
    liveness(req: Request, res: Response): Promise<any>;
    readiness(req: Request, res: Response): Promise<any>;
}

export const IHealthControllerToken = Symbol("IHealthController");
