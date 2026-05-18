import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, Environment } from './env.validation';

@Injectable()
export class AppConfigService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    return this.configService.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === Environment.Production;
  }

  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === Environment.Development;
  }
}