import { Request, Response } from "express";

export interface ISQLSampleController {
    liveness(req: Request, res: Response): Promise<any>;
    readiness(req: Request, res: Response): Promise<any>;
}

export const ISQLSampleControllerToken = Symbol("ISQLSampleController");
