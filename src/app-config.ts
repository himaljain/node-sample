import { CRBAuthorizationServiceConfig } from "@ttx/crb-security-express";
export class AppConfig {
    public static readonly environment: string = process.env.ENVIRONMENT || "LOCAL";
    public static readonly connectionStringName: string = "CMS_API_CON";
    public static readonly authorizationServiceURL: string =
        process.env.AUTHORIZATION_SERVICE_URL || "http://localhost:3001/authorization";
    public static readonly couchbaseClusterEndPoint: string =
        process.env.COUCHBASE_CLUSTER_ENDPOINT || "couchbase://kubwrkdbr04";
    public static readonly couchbaseBucket: string =
        process.env.COUCHBASE_BUCKET || "crb-workqueue";
}
