import { FastifyAdapter } from "@nestjs/platform-fastify";

export function createFastifyAdapter(): FastifyAdapter {
  const adapter = new FastifyAdapter({
    logger: false,
    routerOptions: {
      ignoreTrailingSlash: true,
    },
    forceCloseConnections: true,
    trustProxy: 1,
  });

  const fastify = adapter.getInstance();
  const defaultJsonParser = fastify.getDefaultJsonParser("error", "error");

  fastify.removeContentTypeParser("application/json");
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (request, body, done) => {
      const rawBody = body.toString();

      if (rawBody.trim() === "") {
        done(null, {});
        return;
      }

      defaultJsonParser(request, rawBody, done);
    },
  );

  return adapter;
}
