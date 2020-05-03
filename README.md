# database-connection-pool-mgr

Database connection pool manager implementation from scratch! 

Concerns:
1. I originally was using two maps of active connections and available connections. And each time I needed a connection, I'd move find the key/value of the first key I found in the available connections map and move it to the active connections. Because I was moving and deleting things from two objects, it brought up the concern of race conditions. How could I be sure that another process hadn't grabbed the same key. My first thought was to try to freeze the maps with a Mutex Lock. But then I realized I could use a queue and get rid of having two maps. Working with one data structure made it easier for me to manage. I feel like this would solve my race conditions since I am only doing one operation of dequeueing a connection. If this doesn't solve the race condition, I could still implement a Mutex Lock with the connection queue. 

Things to add: 
1. When we have added more connections to accomodate increased load, we need to remove the unused ones after a certain amount of idle time. My first thought would be to use an internal timer for each connection and once it reaches a certain idle time without being used, we would remove it from the connectionQueue. But setting a bunch of internal timers would be wasteful computing resources and memory for every single connection. I then thought, we could use event emitters and listeners.

There could be an event emitter in the PoolManager class that emits a "heartbeat" in long intervals and each connection, could have an "idle" event listener listening for the "heartbeats". When a request comes through, it will go to the Pool manager and ask for a connection. The Pool Manager will remove the "idle" event listener from the connection and give it to the request to do its business. Once the request is done, the Pool manager will add the "idle" event listener back on to the connection. This way, when the Pool manager emits its "heartbeat" event, active connections won't hear it. The connections that do hear the "heartbeat" will be removed from the connectionQueue until it gets to the minimum threshhold.
