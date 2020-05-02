import uuid from 'uuid';
import { PoolManagerConfig } from './interfaces';

export default class PoolManager {
    private static DEFAULT_CONNECTIONS: number = 5;
    private min: number;
    private active = {};
    private available = {};
    private options: PoolManagerConfig;
    private Client: any;

    /**
     * @param options PoolManagerConfig
     * @param client the constructor of a postgres or mysql client or something similar.
     */
    constructor(options: PoolManagerConfig, client: any) {
        this.options = options;
        this.Client = client;
        this.min = options.min || PoolManager.DEFAULT_CONNECTIONS;
        this.openBatchConnections(this.min);
    }

    /**
     * This is the only public method because we want to encapsulate the pool mgr connecting logic.
     * @param text SQL statement. Didn't go into detail on the different types of queries i could do.
     * Focusing more on the implementation of the pool manager.
     */
    public query(text: string) {
        const client = this.getConnection();
        client.query(text, (err: Error, res: any) => {
            if (err) {
                throw err;
            }
            this.releaseConnection(client.key);
            return res;
        });
    }

    private openBatchConnections(connex: number) {
        const newConnections = {};
        for (let i = 0; i < connex; i++) {
            const connection = this.connect();
            newConnections[connection.key] = connection;
        }
        this.available = Object.assign(this.available, newConnections);
    }

    private claimConnection() {
        const keys = Object.keys(this.available);
        this.active[keys[0]] = this.available[keys[0]];
        delete this.available[keys[0]];
        return this.active[keys[0]];
    }

    private connectionIsAvailable() {
        return Object.keys(this.available).length > 0;
    }

    private getConnection() {
        if (!this.connectionIsAvailable()) {
            this.openBatchConnections(this.min);
        }
        return this.claimConnection();
    }

    private releaseConnection(key: string) {
        this.available[key] = this.active[key];
        delete this.active[key];
    }

    private createGuid() {
        return uuid.v4();;
    }

    private connect() {
        return Object.assign(new this.Client(this.options), { key: this.createGuid() });
    }
}
