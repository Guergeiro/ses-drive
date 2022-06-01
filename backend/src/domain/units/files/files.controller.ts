import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { BothAuthGuard } from "@guards/both-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
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
import { DeleteFileService } from "./use-cases/delete-file/delete-file.service";
import { DownloadFileService } from "./use-cases/download-file/download-file.service";
import { GetFileService } from "./use-cases/get-file/get-file.service";
import { GetFilesStatusService } from "./use-cases/get-files-status/get-files-status.service";
import { GetFilesDto } from "./use-cases/get-files/get-files.dto";
import { GetFilesService } from "./use-cases/get-files/get-files.service";
import { RenameFileDto } from "./use-cases/rename-file/rename-file.dto";
import { RenameFileService } from "./use-cases/rename-file/rename-file.service";
import { ShareFileDto } from "./use-cases/share-file/share-file.dto";
import { ShareFileService } from "./use-cases/share-file/share-file.service";

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
  private readonly shareFileService: ShareFileService;
  private readonly deleteFileService: DeleteFileService;
  private readonly renameFileService: RenameFileService;
  private readonly getFileService: GetFileService;

  public constructor(
    createFileService: CreateFileService,
    getFilesService: GetFilesService,
    getFilesStatusService: GetFilesStatusService,
    downloadFileService: DownloadFileService,
    shareFileService: ShareFileService,
    deleteFileService: DeleteFileService,
    renameFileService: RenameFileService,
    getFileService: GetFileService,
  ) {
    this.createFileService = createFileService;
    this.getFilesService = getFilesService;
    this.getFilesStatusService = getFilesStatusService;
    this.downloadFileService = downloadFileService;
    this.shareFileService = shareFileService;
    this.deleteFileService = deleteFileService;
    this.renameFileService = renameFileService;
    this.getFileService = getFileService;
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

  @Get(":id")
  public async getFile(@Param("id") id: string, @UserDecorator() user: User) {
    return await this.getFileService.execute(id, user);
  }

  @Delete(":id")
  @HttpCode(204)
  public async deleteFile(
    @Param("id") id: string,
    @UserDecorator() user: User,
  ) {
    return await this.deleteFileService.execute(id, user);
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

  @Patch(":id/ops/rename")
  @HttpCode(204)
  public async renameFile(
    @Param("id") id: string,
    @Body() body: RenameFileDto,
    @UserDecorator() user: User,
  ) {
    return await this.renameFileService.execute(id, body, user);
  }

  @Patch(":id/ops/share")
  @HttpCode(204)
  public async shareFile(
    @Param("id") id: string,
    @UserDecorator() user: User,
    @Body() body: ShareFileDto,
  ) {
    return await this.shareFileService.execute(id, user, body);
  }
}
