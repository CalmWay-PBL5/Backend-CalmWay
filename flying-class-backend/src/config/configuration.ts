const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
};

export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parsePort(process.env.PORT ?? process.env.API_PORT, 3000),
  },
  database: {
    url: process.env.DATABASE_URL,
    shadowUrl: process.env.SHADOW_DATABASE_URL,
    name: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: parsePort(process.env.POSTGRES_PORT, 5432),
  },
  secrets: {
    dbOwner: process.env.DB_OWNER_PASSWORD,
    prisma: process.env.PRISMA_PASSWORD,
    app: process.env.APP_PASSWORD,
    readonly: process.env.READONLY_PASSWORD,
  },
  redis: {
    url: process.env.REDIS_URL,
    port: parsePort(process.env.REDIS_PORT, 6379),
  },
});