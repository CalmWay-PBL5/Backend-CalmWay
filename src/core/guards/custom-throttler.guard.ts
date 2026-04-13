import {
  Injectable,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: any,
  ): Promise<void> {
    throw new HttpException(
      "Too many requests from this IP. Please wait 60 seconds before trying again.",
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
