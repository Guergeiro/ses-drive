import { Module } from "@nestjs/common";
import { FileController } from "./file.controller";
import { CreateFileService } from "./use-cases/create-file/create-file.service";

@Module({
  controllers: [FileController],
  providers: [CreateFileService],
})
export class FileModule {}
