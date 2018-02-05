import { CRBSQLDBBase } from "@ttx/crb-security-express";
import { ISQLHelper, ISQLHelperToken } from "@ttx/ttx-db-mssql-helper";
import { inject, injectable } from "inversify";
import { IHealthDB } from "./health.db.interface";

// TODO: Find and Use Typins for squel.
// import * as squel from "squel";
const squel = require("squel");
const mssquel = squel.useFlavour("mssql");

@injectable()
export class HealthDB extends CRBSQLDBBase implements IHealthDB {

    constructor( @inject(ISQLHelperToken) dbHelper: ISQLHelper) {
        super(dbHelper);
    }

    public async checkDBConnection() {
        let query = mssquel.select();
        query = query.field("GETDATE()", "date").toString();
        const result = await this.dbHelper.executeSqlQuery(query);
        return result;
    }

}
