import { Token } from "@entities/token.entity";
import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ServicesModule } from "@services/services.module";
import { AccessTokenStrategyService } from "./access-token-strategy/access-token-strategy.service";
import { ApiKeyStrategyService } from "./api-key-strategy/api-key-strategy.service";
import { RefreshTokenStrategyService } from "./refresh-token-strategy/refresh-token-strategy.service";

@Module({
  imports: [MikroOrmModule.forFeature([User, Token]), ServicesModule],
  providers: [
    AccessTokenStrategyService,
    ApiKeyStrategyService,
    RefreshTokenStrategyService,
  ],
})
export class PassportStrategiesModule {}
