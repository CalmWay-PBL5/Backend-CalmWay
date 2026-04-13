"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createFastifyAdapter", {
    enumerable: true,
    get: function() {
        return createFastifyAdapter;
    }
});
const _platformfastify = require("@nestjs/platform-fastify");
function createFastifyAdapter() {
    const adapter = new _platformfastify.FastifyAdapter({
        logger: false,
        routerOptions: {
            ignoreTrailingSlash: true
        },
        forceCloseConnections: true,
        trustProxy: 1
    });
    const fastify = adapter.getInstance();
    const defaultJsonParser = fastify.getDefaultJsonParser("error", "error");
    fastify.removeContentTypeParser("application/json");
    fastify.addContentTypeParser("application/json", {
        parseAs: "string"
    }, (request, body, done)=>{
        const rawBody = body.toString();
        if (rawBody.trim() === "") {
            done(null, {});
            return;
        }
        defaultJsonParser(request, rawBody, done);
    });
    return adapter;
}

//# sourceMappingURL=fastify.setup.js.map