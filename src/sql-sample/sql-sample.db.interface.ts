import { ICRBSQLDBBase } from "@ttx/crb-security-express";
export interface ISQLSampleDB extends ICRBSQLDBBase {
    checkDBConnection(): Promise<any>;
}

export const ISQLSampleDBToken = Symbol("ISQLSampleDB");
