import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port(),
  API_PORT: Joi.number().port(),
  
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().allow('').default(''),
  POSTGRES_PORT: Joi.number().port().default(5432),
  
  DB_OWNER_PASSWORD: Joi.string().allow('').default(''),
  PRISMA_PASSWORD: Joi.string().allow('').default(''),
  APP_PASSWORD: Joi.string().allow('').default(''),
  READONLY_PASSWORD: Joi.string().allow('').default(''),
  
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),

  PRISMA_DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).optional(),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  SHADOW_DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).optional(),
}).or('PORT', 'API_PORT');