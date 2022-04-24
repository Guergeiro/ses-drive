import { Module } from "@nestjs/common";
import { FileModule } from "./units/file/file.module";
import { AuthModule } from "./units/auth/auth.module";

@Module({
  imports: [FileModule, AuthModule],
})
export class DomainModule {}
