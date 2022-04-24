import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { JwtStrategyService } from "./jwt-strategy/jwt-strategy.service";

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [JwtStrategyService],
  exports: [JwtStrategyService],
})
export class PassportModule {}
