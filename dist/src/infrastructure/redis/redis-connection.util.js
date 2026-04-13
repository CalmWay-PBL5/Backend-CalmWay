"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "parseRedisConnection", {
    enumerable: true,
    get: function() {
        return parseRedisConnection;
    }
});
function parseRedisConnection(redisUrl, redisPassword) {
    const url = new URL(redisUrl);
    return {
        host: url.hostname,
        port: url.port ? Number(url.port) : 6379,
        password: redisPassword || (url.password ? decodeURIComponent(url.password) : undefined),
        maxRetriesPerRequest: null
    };
}

//# sourceMappingURL=redis-connection.util.js.map