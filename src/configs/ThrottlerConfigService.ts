import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerOptionsFactory } from "@nestjs/throttler";

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  private readonly configService: ConfigService;

  public constructor(configService: ConfigService) {
    this.configService = configService;
  }

  public createThrottlerOptions() {
    return {
      ttl: this.configService.get<number>("ratelimiter.TTL"),
      limit: this.configService.get<number>("ratelimiter.LIMIT"),
    };
  }
}
