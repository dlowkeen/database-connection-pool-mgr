import uuid from 'uuid';
import { PoolManagerConfig } from './interfaces';

export default class PoolManager {
    private static DEFAULT_CONNECTIONS: number = 5;
    private min: number;
    private active = {};
    private all = {};
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
        this.all = Object.assign(this.all, newConnections);
        this.available = newConnections;
    }

    private claimConnection() {
        const keys = Object.keys(this.available);
        this.active[keys[0]] = this.available[keys[0]];
        delete this.available[keys[0]];
        return this.active[keys[0]];
    }

    private getConnection() {
        if (!(this.active < Object.keys(this.all).length)) {
            this.openBatchConnections(this.min);
        }
        return this.claimConnection();
    }

    private releaseConnection(connectionKey: string) {
        this.available[connectionKey] = this.active[connectionKey];
        delete this.active[connectionKey];
        // minimum is 5
        // current connections in use = 17
        // available connections is = 40
    }

    private createGuid() {
        return uuid.v4();;
    }

    private connect() {
        return Object.assign(new this.Client(this.options), { key: this.createGuid() });
    }
}

// initialize the pool manager on app start up