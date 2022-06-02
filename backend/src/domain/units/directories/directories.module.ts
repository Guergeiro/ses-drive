import { Directory } from "@entities/directory.entity";
import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { DirectoriesController } from "./directories.controller";
import { CreateDirectoryService } from "./use-cases/create-directory/create-directory.service";
import { DeleteDirectoryService } from "./use-cases/delete-directory/delete-directory.service";
import { GetDirectoriesService } from "./use-cases/get-directories/get-directories.service";
import { RenameDirectoryService } from "./use-cases/rename-directory/rename-directory.service";
import { ShareDirectoryService } from "./use-cases/share-directory/share-directory.service";
import { GetDirectoryService } from "./use-cases/get-directory/get-directory.service";

@Module({
  controllers: [DirectoriesController],
  imports: [MikroOrmModule.forFeature([Directory, File, User])],
  providers: [
    CreateDirectoryService,
    GetDirectoriesService,
    DeleteDirectoryService,
    RenameDirectoryService,
    ShareDirectoryService,
    GetDirectoryService,
  ],
})
export class DirectoriesModule {}
