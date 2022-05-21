import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { MeController } from "./me.controller";
import { GenerateApiKeyService } from "./use-cases/generate-api-key/generate-api-key.service";

@Module({
  controllers: [MeController],
  imports: [MikroOrmModule.forFeature([User])],
  providers: [GenerateApiKeyService],
})
export class MeModule {}
