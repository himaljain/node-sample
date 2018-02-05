import { ICouchbaseDBBase } from "@ttx/ttx-db-couchbase-helper";
export interface ICouchbaseSampleDB extends ICouchbaseDBBase {
    getWorkqueue(): Promise<any>;
}

export const ICouchbaseSampleDBToken = Symbol("ICouchbaseSampleDB");
