export declare const config: {
    supabase: {
        url: string;
        key: string;
        serviceRoleKey: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    wechat: {
        appId: string;
        appSecret: string;
    };
    app: {
        name: string;
        env: string;
        port: number;
    };
    s3: {
        endpoint: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
        region: string;
    };
    llm: {
        apiKey: string;
        apiUrl: string;
    };
};
export default config;
