import { Module } from "@nestjs/common";
import { ServicesModule } from "./services/services.module";
import { PassportModule } from "./passport/passport.module";

@Module({
  imports: [ServicesModule, PassportModule],
})
export class SharedModule {}
