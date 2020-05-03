interface BaseConfig {
    user?: string;
    database?: string;
    password?: string;
    port?: number;
    host?: string;
    connectionString?: string;
}

/**
 * Debating if we want to have 'max' or not? Feel like we probably shouldnt place a cap.
 * Or if we did, maybe that would signal that we need to spin up a new instance.
 */
export interface PoolManagerConfig extends BaseConfig {
    min?: number,
    // max?: number,
    idleTimeout?: number,
}

/**
 * Just a mock Client interface
 */
export interface IClient {
    constructor(config?: BaseConfig): any;
    query (text: string, cb: (err: Error, res: any) => any): any;
}
