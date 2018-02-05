import { Request, Response } from "express";

export interface ICouchbaseSampleController {
    get(req: Request, res: Response): Promise<any>;
}

export const ICouchbaseSampleControllerToken = Symbol("ICouchbaseSampleController");
