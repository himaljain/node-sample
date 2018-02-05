export class InjectionToken {
    public static readonly ExpressApplicationToken = Symbol("ExpressApplicationToken");
    public static readonly DBFactoryToken = Symbol("DBFactoryToken");
    public static readonly CouchbaseDBFactoryToken = Symbol("CouchbaseDBFactoryToken");
}
