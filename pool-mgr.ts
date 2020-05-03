import { IClient, PoolManagerConfig } from './interfaces';

export default class PoolManager {
    private static DEFAULT_CONNECTIONS: number = 5;
    private min: number;
    private connectionQueue: IClient[] = [];
    private options: PoolManagerConfig;
    private Client: any;

    /**
     * @param options PoolManagerConfig
     * @param client the constructor of a postgres or mysql client or something similar.
     */
    constructor(options: PoolManagerConfig, client: IClient) {
        this.options = options;
        this.Client = client;
        this.min = options.min || PoolManager.DEFAULT_CONNECTIONS;
        this.openBatchConnections(this.min);
    }

    /**
     * This is the only public method because we want to encapsulate the pool mgr connecting logic.
     * @param text SQL statement. Didn't go into detail on the different types of queries i could do.
     * Focusing more on the implementation of the pool manager. Operating under assumption, client
     * contains a 'query' method.
     */
    public query(text: string) {
        const { client, err } = this.getConnection();
        if (err) { throw err }
        if (client) {
            client.query(text, (err: Error, res: any) => {
                if (err) {
                    throw err;
                }
                this.releaseConnection(client);
                return res;
            });
        }
    }

    private openBatchConnections(connex: number) {
        for (let i = 0; i < connex; i++) {
            const connection = this.connect();
            this.connectionQueue.push(connection);
        }
    }

    private claimConnection() {
        const connection = this.connectionQueue.shift();
        return connection;
    }

    private connectionIsAvailable() {
        return this.connectionQueue.length > 0;
    }

    private getConnection() {
        let client = null;
        let err = null;
        try {
            if (!this.connectionIsAvailable()) {
                this.openBatchConnections(this.min);
            }
            client = this.claimConnection();
        } catch (err) {
            err = err;
        } finally {
            return { client, err }
        }
    }

    private releaseConnection(client: any) {
        this.connectionQueue.push(client);
    }

    private connect() {
        return new this.Client(this.options);
    }
}
