import { Directory } from "@entities/directory.entity";
import { File } from "@entities/file.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { DirectoriesController } from "./directories.controller";
import { CreateDirectoryService } from "./use-cases/create-directory/create-directory.service";
import { GetDirectoriesService } from "./use-cases/get-directories/get-directories.service";
import { DeleteDirectoryService } from "./use-cases/delete-directory/delete-directory.service";
import { RenameDirectoryService } from "./use-cases/rename-directory/rename-directory.service";

@Module({
  controllers: [DirectoriesController],
  imports: [MikroOrmModule.forFeature([Directory, File])],
  providers: [
    CreateDirectoryService,
    GetDirectoriesService,
    DeleteDirectoryService,
    RenameDirectoryService,
  ],
})
export class DirectoriesModule {}
