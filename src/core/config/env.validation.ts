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
  REDIS_PASSWORD?: string;

  @IsString()
  @IsNotEmpty()
  S3_ACCESS_KEY!: string;

  @IsString()
  @IsNotEmpty()
  S3_SECRET_KEY!: string;

  @IsString()
  @IsNotEmpty()
  S3_BUCKET_NAME!: string;

  @IsString()
  @IsNotEmpty()
  S3_ENDPOINT!: string;

  @IsString()
  @IsOptional()
  S3_REGION?: string;

  @IsString()
  @IsOptional()
  S3_PUBLIC_ENDPOINT?: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL!: string;

  // Mail Configurations
  @IsString()
  @IsNotEmpty()
  MAIL_HOST!: string;

  @IsNumber()
  @IsNotEmpty()
  MAIL_PORT!: number;

  @IsString()
  @IsIn(["true", "false"])
  MAIL_SECURE!: string;

  @IsString()
  @IsNotEmpty()
  MAIL_USER!: string;

  @IsString()
  @IsNotEmpty()
  MAIL_PASS!: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  GEMINI_API_KEY!: string;
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
