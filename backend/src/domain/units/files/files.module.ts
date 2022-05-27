import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { File } from "@entities/file.entity";
import { FilesController } from "./files.controller";
import { CreateFileService } from "./use-cases/create-file/create-file.service";
import { GetFilesService } from "./use-cases/get-files/get-files.service";
import { ServicesModule } from "@services/services.module";
import { GetFilesStatusService } from "./use-cases/get-files-status/get-files-status.service";
import { Directory } from "@entities/directory.entity";
import { DownloadFileService } from './use-cases/download-file/download-file.service';

@Module({
  controllers: [FilesController],
  imports: [MikroOrmModule.forFeature([File, Directory]), ServicesModule],
  providers: [CreateFileService, GetFilesService, GetFilesStatusService, DownloadFileService],
})
export class FilesModule {}
