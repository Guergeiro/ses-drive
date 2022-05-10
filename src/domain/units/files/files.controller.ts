import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { CreateFileService } from "./use-cases/create-file/create-file.service";

@ApiBearerAuth()
@ApiTags("files")
@Controller("files")
export class FilesController {
  private readonly createFileService: CreateFileService;

  public constructor(createFileService: CreateFileService) {
    this.createFileService = createFileService;
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: memoryStorage(),
    }),
  )
  public async create(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
    return await this.createFileService.execute(files);
  }
}
