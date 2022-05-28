import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { BothAuthGuard } from "@guards/both-auth.guard";
import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Sse,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { memoryStorage } from "multer";
import { CreateFileDto } from "./use-cases/create-file/create-file.dto";
import { CreateFileService } from "./use-cases/create-file/create-file.service";
import { DownloadFileService } from "./use-cases/download-file/download-file.service";
import { GetFilesStatusService } from "./use-cases/get-files-status/get-files-status.service";
import { GetFilesDto } from "./use-cases/get-files/get-files.dto";
import { GetFilesService } from "./use-cases/get-files/get-files.service";

@ApiTags("files")
@ApiSecurity("x-api-key")
@ApiBearerAuth()
@UseGuards(BothAuthGuard)
@Controller("files")
export class FilesController {
  private readonly createFileService: CreateFileService;
  private readonly getFilesService: GetFilesService;
  private readonly getFilesStatusService: GetFilesStatusService;
  private readonly downloadFileService: DownloadFileService;

  public constructor(
    createFileService: CreateFileService,
    getFilesService: GetFilesService,
    getFilesStatusService: GetFilesStatusService,
    downloadFileService: DownloadFileService,
  ) {
    this.createFileService = createFileService;
    this.getFilesService = getFilesService;
    this.getFilesStatusService = getFilesStatusService;
    this.downloadFileService = downloadFileService;
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: CreateFileDto,
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: {
        files: 10,
      },
    }),
  )
  public async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @UserDecorator() user: User,
  ) {
    return await this.createFileService.execute(files, user);
  }

  @Get()
  public async getFiles(
    @Query() body: GetFilesDto,
    @UserDecorator() user: User,
  ) {
    return await this.getFilesService.execute(body, user);
  }

  @Sse("status")
  public getFileStatus(@UserDecorator() user: User) {
    return this.getFilesStatusService.execute(user);
  }

  @Get(":id/ops/download")
  public async downloadFile(
    @Req() request: Request,
    @Param("id") id: string,
    @UserDecorator() user: User,
  ) {
    const { fileObj, buffer } = await this.downloadFileService.execute(
      id,
      user,
    );
    request.res.attachment(fileObj.name);
    return new StreamableFile(buffer);
  }
}
