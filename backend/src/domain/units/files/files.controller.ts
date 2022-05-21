import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { AccessJwtAuthGuard } from "@guards/access-jwt.guard";
import { ApiKeyGuard } from "@guards/api-key.guard";
import { BothAuthGuard } from "@guards/both-auth.guard";
import {
  Controller,
  Get,
  Post,
  Query,
  Sse,
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
import { memoryStorage } from "multer";
import { CreateFileDto } from "./use-cases/create-file/create-file.dto";
import { CreateFileService } from "./use-cases/create-file/create-file.service";
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

  public constructor(
    createFileService: CreateFileService,
    getFilesService: GetFilesService,
    getFilesStatusService: GetFilesStatusService,
  ) {
    this.createFileService = createFileService;
    this.getFilesService = getFilesService;
    this.getFilesStatusService = getFilesStatusService;
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
    console.log(files);
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
}
