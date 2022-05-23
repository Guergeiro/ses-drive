import { Directory } from "@entities/directory.entity";
import { Token } from "@entities/token.entity";
import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServicesModule } from "@services/services.module";
import * as cors from "cors";
import { AuthController } from "./auth.controller";
import { RefreshService } from "./use-cases/refresh/refresh.service";
import { SignInService } from "./use-cases/sign-in/sign-in.service";
import { SignOutService } from "./use-cases/sign-out/sign-out.service";
import { SignUpService } from "./use-cases/sign-up/sign-up.service";

@Module({
  controllers: [AuthController],
  imports: [
    MikroOrmModule.forFeature([User, Token, Directory]),
    ServicesModule,
  ],
  providers: [SignInService, SignUpService, RefreshService, SignOutService],
})
export class AuthModule implements NestModule {
  private readonly configService: ConfigService;

  public constructor(configService: ConfigService) {
    this.configService = configService;
  }

  public configure(consumer: MiddlewareConsumer) {
    const config: cors.CorsOptions = { credentials: true };

    const appUrl = this.configService.get<string>("host.APP_URL");
    if (this.configService.get<string>("NODE_ENV") === "development") {
      const appPort = this.configService.get<number>("host.APP_PORT");
      config.origin = `http://${appUrl}:${appPort}`;
    } else {
      config.origin = `https://${appUrl}`;
    }

    const corsConfig = cors(config);
    consumer.apply(corsConfig).forRoutes("auth");
  }
}
