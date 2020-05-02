class PoolManager {
    public initialConnex: number;
    public static DEFAULT_CONNECTIONS: number = 5;
    public connectionsInUse = {};
    public allConnections = {};
    public connectionsAvailable = {};

    constructor(initialConnex?: number) {
        this.initialConnex = initialConnex || PoolManager.DEFAULT_CONNECTIONS;
    }
    private openBatchConnections(connex: number) {
        const newConnections = {};
        for (let i = 0; i < connex; i++)  {
            newConnections[this.createGuid()] = this.connected();
        }
        this.allConnections = Object.assign(this.allConnections, newConnections);
        this.connectionsAvailable = newConnections;
    }
    private claimConnection() {
        const keys = Object.keys(this.connectionsAvailable);
        this.connectionsInUse[keys[0]] = this.connectionsAvailable[keys[0]];
        delete this.connectionsAvailable[keys[0]];
        return this.connectionsInUse[keys[0]];
    }
    public getConnection() {
        if (!(this.connectionsInUse < Object.keys(this.allConnections).length)) {
            this.openBatchConnections(PoolManager.DEFAULT_CONNECTIONS);
        }
        return this.claimConnection();
    }
    public releaseConnection(connectionKey: string) {
        this.connectionsAvailable[connectionKey] = this.connectionsInUse[connectionKey];
        delete this.connectionsInUse[connectionKey];
        // minimum is 5
        // current connections in use = 17
        // available connections is = 40
    }
    private createGuid() {
        return 'alskdfasdf';
    }
    // private checkAvailableConnex() {

    // }
    private connected() {

    }
}

// dependency injection to inject the actual database that we're going to use
// pass in the env vars for the database to connect
// initialize the pool manager on app start up
// once we have a pool, we're ready to start receiving requests for connections

