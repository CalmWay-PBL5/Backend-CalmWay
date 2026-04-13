import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppConfigService } from "./core/config/app-config.service";
import { createFastifyAdapter } from "./core/setup/fastify.setup";
import multipart from "@fastify/multipart";

async function bootstrap() {
  process.stdout.write("\n");
  const logger = new Logger("Bootstrap");

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      createFastifyAdapter(),
      { bodyParser: false },
    );
    await app.register(multipart, {
      limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB global hard cap
    });

    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
      }),
    );

    app.setGlobalPrefix("api/v1");
    app.enableShutdownHooks();

    const config = app.get(AppConfigService);
    const port = Number(config.get("PORT")) || 3001;

    // CRITICAL for rate limiting behind reverse proxies.
    // For Fastify, trustProxy is enabled in createFastifyAdapter().
    (app.getHttpAdapter().getInstance() as { setTrustProxy?: (value: number) => void }).setTrustProxy?.(1);

    await app.listen(port, "0.0.0.0");

    logger.log(
      `🚀 Application is successfully running on: ${await app.getUrl()}`,
    );
  } catch (error) {
    logger.error("Failed to start the application", error);
    process.exit(1);
  }
}

bootstrap();
