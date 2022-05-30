import { Module } from "@nestjs/common";
import { PassportStrategiesModule } from "./passport-strategies/passport-strategies.module";

@Module({
  imports: [PassportStrategiesModule],
  exports: [PassportStrategiesModule],
})
export class SecurityModule {}
