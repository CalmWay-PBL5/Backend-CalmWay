import type { RedisOptions } from "ioredis";

export function parseRedisConnection(
  redisUrl?: string,
  password?: string,
): RedisOptions {
  if (!redisUrl) {
    return {
      host: "localhost",
      port: 6379,
      password: password || undefined,
    };
  }

  const url = new URL(redisUrl);
  const port = url.port ? Number(url.port) : 6379;
  const db = url.pathname ? Number(url.pathname.replace("/", "")) : undefined;
  const resolvedPassword = password || url.password || undefined;
  const username = url.username || undefined;

  return {
    host: url.hostname,
    port,
    username,
    password: resolvedPassword,
    db: Number.isFinite(db as number) ? (db as number) : undefined,
  };
}
