import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { CreateFileService } from "./use-cases/create-file/create-file.service";

@Module({
  controllers: [FilesController],
  providers: [CreateFileService],
})
export class FilesModule {}
