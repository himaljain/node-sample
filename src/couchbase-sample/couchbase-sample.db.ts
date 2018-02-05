import { CouchbaseDBBase, ICouchbaseHelper, ICouchbaseHelperToken } from "@ttx/ttx-db-couchbase-helper";
import { inject, injectable } from "inversify";

import { Activities } from "../activities";
import { ICouchbaseSampleDB } from "./couchbase-sample.db.interface";

@injectable()
export class CouchbaseSampleDB extends CouchbaseDBBase implements ICouchbaseSampleDB {

    constructor( @inject(ICouchbaseHelperToken) dbHelper: ICouchbaseHelper) {
        super(dbHelper);
    }

    public async getWorkqueue() {
        this.logger.info("Sample log message from DB ");
        const q: string = "SELECT * FROM `crb-workqueue` WHERE `workqueue-category` = 'Auditing Auditor Review' AND `client` = 'ADMX'";
        const result: any = await this.dbHelper.query(q);
        return result;
    }

}
