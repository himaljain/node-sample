import { CRBSQLDBBase } from "@ttx/crb-security-express";
import { ISQLHelper, ISQLHelperToken } from "@ttx/ttx-db-mssql-helper";
import { inject, injectable } from "inversify";

import { Activities } from "../activities";
import { ISQLSampleDB } from "./sql-sample.db.interface";

// TODO: Find and Use Typins for squel.
// import * as squel from "squel";
const squel = require("squel");
const mssquel = squel.useFlavour("mssql");

@injectable()
export class SQLSampleDB extends CRBSQLDBBase implements ISQLSampleDB {

    constructor( @inject(ISQLHelperToken) dbHelper: ISQLHelper) {
        super(dbHelper);
    }

    public async checkDBConnection() {
        let query = mssquel.select();

        // Example of TVP.
        // let securityParam = this.getFacilitySecurityTVPParam([Activities.PriceMasterRead],"securittyParam","TMNT_CRB_FAC_SEC");
        this.logger.info("Sample log message from DB ");
        query = query.field("GETDATE()", "date").toString();
        const result = await this.dbHelper.executeSqlQuery(query);
        return result;
    }

}
