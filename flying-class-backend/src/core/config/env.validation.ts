import { plainToInstance } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  validateSync,
  IsOptional,
  IsNumber,
  IsIn,
} from "class-validator";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  S3_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  S3_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  S3_BUCKET_NAME?: string;

  @IsString()
  @IsOptional()
  S3_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  S3_REGION?: string;

  @IsString()
  @IsOptional()
  S3_PUBLIC_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = "http://localhost:3000";

  // Mail Configurations
  @IsString()
  @IsOptional()
  MAIL_HOST: string = "localhost";

  @IsNumber()
  @IsOptional()
  MAIL_PORT: number = 1025;

  @IsString()
  @IsIn(["true", "false"])
  @IsOptional()
  MAIL_SECURE: string = "false";

  @IsString()
  @IsOptional()
  MAIL_USER: string = "dev";

  @IsString()
  @IsOptional()
  MAIL_PASS: string = "dev";

  @IsString()
  @IsOptional()
  MAIL_FROM: string = "noreply@localhost";

  @IsString()
  @IsOptional()
  JWT_SECRET: string = "dev-jwt-secret";

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = "1h";

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET: string = "dev-refresh-secret";

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = "7d";

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false, // Set to false to ensure all @IsNotEmpty fields are present
  });

  if (errors.length > 0) {
    throw new Error(
      `❌ Invalid Environment Configuration: \n${errors.toString()}`,
    );
  }

  return validatedConfig;
}
