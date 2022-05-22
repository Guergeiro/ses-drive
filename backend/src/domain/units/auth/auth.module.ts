import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ServicesModule } from "@services/services.module";
import { AuthController } from "./auth.controller";
import { SignInService } from "./use-cases/sign-in/sign-in.service";
import { SignUpService } from "./use-cases/sign-up/sign-up.service";
import { RefreshService } from "./use-cases/refresh/refresh.service";
import { Token } from "@entities/token.entity";
import { SignOutService } from "./use-cases/sign-out/sign-out.service";
import { Directory } from "@entities/directory.entity";

@Module({
  controllers: [AuthController],
  imports: [
    MikroOrmModule.forFeature([User, Token, Directory]),
    ServicesModule,
  ],
  providers: [SignInService, SignUpService, RefreshService, SignOutService],
})
export class AuthModule {}
