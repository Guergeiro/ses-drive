import { Module } from "@nestjs/common";
import { FilesModule } from "./units/files/files.module";
import { AuthModule } from "./units/auth/auth.module";
import { MeModule } from "./units/me/me.module";
import { DirectoriesModule } from "./units/directories/directories.module";
import { PublicModule } from "./units/public/public.module";

@Module({
  imports: [FilesModule, AuthModule, MeModule, DirectoriesModule, PublicModule],
})
export class DomainModule {}
