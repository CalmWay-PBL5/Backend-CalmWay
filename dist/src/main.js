"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("reflect-metadata");
const _core = require("@nestjs/core");
const _appmodule = require("./app.module");
const _common = require("@nestjs/common");
const _appconfigservice = require("./core/config/app-config.service");
const _fastifysetup = require("./core/setup/fastify.setup");
const _multipart = /*#__PURE__*/ _interop_require_default(require("@fastify/multipart"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function bootstrap() {
    process.stdout.write("\n");
    const logger = new _common.Logger("Bootstrap");
    try {
        const app = await _core.NestFactory.create(_appmodule.AppModule, (0, _fastifysetup.createFastifyAdapter)(), {
            bodyParser: false
        });
        await app.register(_multipart.default, {
            limits: {
                fileSize: 2 * 1024 * 1024 * 1024
            }
        });
        app.enableCors();
        app.useGlobalPipes(new _common.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            stopAtFirstError: true
        }));
        app.setGlobalPrefix("api/v1");
        app.enableShutdownHooks();
        const config = app.get(_appconfigservice.AppConfigService);
        const port = Number(config.get("PORT")) || 3001;
        // CRITICAL for rate limiting behind reverse proxies.
        // For Fastify, trustProxy is enabled in createFastifyAdapter().
        app.getHttpAdapter().getInstance().setTrustProxy?.(1);
        await app.listen(port, "0.0.0.0");
        logger.log(`🚀 Application is successfully running on: ${await app.getUrl()}`);
    } catch (error) {
        logger.error("Failed to start the application", error);
        process.exit(1);
    }
}
bootstrap();

//# sourceMappingURL=main.js.map