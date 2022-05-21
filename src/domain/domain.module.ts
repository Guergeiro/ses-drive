import { Module } from "@nestjs/common";
import { FilesModule } from "./units/files/files.module";
import { AuthModule } from "./units/auth/auth.module";
import { MeModule } from "./units/me/me.module";

@Module({
  imports: [FilesModule, AuthModule, MeModule],
})
export class DomainModule {}
