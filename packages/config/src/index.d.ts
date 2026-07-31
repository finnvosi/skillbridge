export declare const databaseConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean;
    pool: {
        min: number;
        max: number;
        acquire: number;
        idle: number;
    };
};
export declare const redisConfig: {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
    retryStrategy: (times: number) => number;
};
export declare const jwtConfig: {
    readonly secret: string;
    readonly expiresIn: string;
    readonly refreshSecret: string;
    readonly refreshExpiresIn: string;
};
export declare const aiConfig: {
    openai: {
        apiKey: string;
        baseURL: string;
        model: string;
    };
};
export declare const appConfig: {
    port: number;
    nodeEnv: string;
    corsOrigin: string;
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
export declare const uploadConfig: {
    maxFileSize: number;
    uploadDir: string;
    allowedTypes: string[];
};
export declare const paginationConfig: {
    defaultPage: number;
    defaultLimit: number;
    maxLimit: number;
};
export declare const validationRules: {
    password: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecial: boolean;
    };
    username: {
        minLength: number;
        maxLength: number;
        pattern: RegExp;
    };
};
export declare const defaults: {
    userAvatar: string;
    companyLogo: string;
    projectImage: string;
};
declare const _default: {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl: boolean;
        pool: {
            min: number;
            max: number;
            acquire: number;
            idle: number;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        retryStrategy: (times: number) => number;
    };
    jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshSecret: string;
        readonly refreshExpiresIn: string;
    };
    ai: {
        openai: {
            apiKey: string;
            baseURL: string;
            model: string;
        };
    };
    app: {
        port: number;
        nodeEnv: string;
        corsOrigin: string;
        rateLimit: {
            windowMs: number;
            max: number;
        };
    };
    upload: {
        maxFileSize: number;
        uploadDir: string;
        allowedTypes: string[];
    };
    pagination: {
        defaultPage: number;
        defaultLimit: number;
        maxLimit: number;
    };
    validation: {
        password: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSpecial: boolean;
        };
        username: {
            minLength: number;
            maxLength: number;
            pattern: RegExp;
        };
    };
    defaults: {
        userAvatar: string;
        companyLogo: string;
        projectImage: string;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map