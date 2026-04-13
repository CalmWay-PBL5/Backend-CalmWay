export type RedisConnectionConfig = {
  host: string;
  port: number;
  password?: string;
  maxRetriesPerRequest?: null; // 🚀 QUAN TRỌNG: Required bởi BullMQ
};

export function parseRedisConnection(
  redisUrl: string,
  redisPassword?: string,
): RedisConnectionConfig {
  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    password:
      redisPassword ||
      (url.password ? decodeURIComponent(url.password) : undefined),
    maxRetriesPerRequest: null, // 🚀 BUG FIX: Ngăn BullMQ thử kết nối vô hạn làm treo API
  };
}
