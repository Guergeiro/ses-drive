import { Module } from "@nestjs/common";
import { FilesModule } from "./units/files/files.module";
import { AuthModule } from "./units/auth/auth.module";

@Module({
  imports: [FilesModule, AuthModule],
})
export class DomainModule {}
