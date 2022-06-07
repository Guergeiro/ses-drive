import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { MeController } from "./me.controller";
import { GenerateApiKeyService } from "./use-cases/generate-api-key/generate-api-key.service";
import { ChangePasswordService } from './use-cases/change-password/change-password.service';

@Module({
  controllers: [MeController],
  imports: [MikroOrmModule.forFeature([User])],
  providers: [GenerateApiKeyService, ChangePasswordService],
})
export class MeModule {}
