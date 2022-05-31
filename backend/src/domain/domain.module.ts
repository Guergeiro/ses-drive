import { Module } from "@nestjs/common";
import { FilesModule } from "./units/files/files.module";
import { AuthModule } from "./units/auth/auth.module";
import { MeModule } from "./units/me/me.module";
import { DirectoriesModule } from "./units/directories/directories.module";

@Module({
  imports: [FilesModule, AuthModule, MeModule, DirectoriesModule],
})
export class DomainModule {}
