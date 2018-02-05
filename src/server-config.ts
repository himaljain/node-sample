export class ServerConfig {
    public static readonly port: number = process.env.EXPRESS_PORT || 3000;
    public static readonly isHttps: boolean = false;
}
