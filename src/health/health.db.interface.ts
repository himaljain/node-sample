import { ICRBSQLDBBase } from "@ttx/crb-security-express";
export interface IHealthDB extends ICRBSQLDBBase  {
    checkDBConnection(): Promise<any>;
}

export const IHealthDBToken = Symbol("IHealthDBToken");
