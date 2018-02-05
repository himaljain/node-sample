import { Activity, IActivity } from "@ttx/ttx-security-core";
export class Activities {
    public static readonly PriceMasterRead: IActivity = new Activity("PriceMasterRead");
    public static readonly Dummy: IActivity = new Activity("Dummy");
    public static readonly InitiateShopAuditingException: IActivity = new Activity("InitiateShopAuditingException");
}
