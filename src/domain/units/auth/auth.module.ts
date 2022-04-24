import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { SignInService } from "./use-cases/sign-in/sign-in.service";
import { SignUpService } from "./use-cases/sign-up/sign-up.service";

@Module({
  controllers: [AuthController],
  providers: [SignInService, SignUpService],
  imports: [MikroOrmModule.forFeature([User])],
})
export class AuthModule {}
