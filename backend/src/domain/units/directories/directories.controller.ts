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
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiSecurity, ApiBearerAuth } from "@nestjs/swagger";
import { CreateDirectoryDto } from "./use-cases/create-directory/create-directory.dto";
import { CreateDirectoryService } from "./use-cases/create-directory/create-directory.service";
import { DeleteDirectoryService } from "./use-cases/delete-directory/delete-directory.service";
import { GetDirectoriesDto } from "./use-cases/get-directories/get-directories.dto";
import { GetDirectoriesService } from "./use-cases/get-directories/get-directories.service";
import { RenameDirectoryDto } from "./use-cases/rename-directory/rename-directory.dto";
import { RenameDirectoryService } from "./use-cases/rename-directory/rename-directory.service";
import { ShareDirectoryDto } from "./use-cases/share-directory/share-directory.dto";
import { ShareDirectoryService } from "./use-cases/share-directory/share-directory.service";

@ApiTags("directories")
@ApiSecurity("x-api-key")
@ApiBearerAuth()
@UseGuards(BothAuthGuard)
@Controller("directories")
export class DirectoriesController {
  private readonly getDirectoriesService: GetDirectoriesService;
  private readonly createDirectoryService: CreateDirectoryService;
  private readonly deleteDirectoryService: DeleteDirectoryService;
  private readonly renameDirectoryService: RenameDirectoryService;
  private readonly shareDirectoryService: ShareDirectoryService;

  public constructor(
    getDirectoriesService: GetDirectoriesService,
    createDirectoryService: CreateDirectoryService,
    deleteDirectoryService: DeleteDirectoryService,
    renameDirectoryService: RenameDirectoryService,
    shareDirectoryService: ShareDirectoryService,
  ) {
    this.getDirectoriesService = getDirectoriesService;
    this.createDirectoryService = createDirectoryService;
    this.deleteDirectoryService = deleteDirectoryService;
    this.renameDirectoryService = renameDirectoryService;
    this.shareDirectoryService = shareDirectoryService;
  }

  @Get()
  public async getDirectories(
    @Query() body: GetDirectoriesDto,
    @UserDecorator() user: User,
  ) {
    return await this.getDirectoriesService.execute(body, user);
  }

  @Post()
  public async createDirectory(
    @Body() body: CreateDirectoryDto,
    @UserDecorator() user: User,
  ) {
    return await this.createDirectoryService.execute(body, user);
  }

  @Delete(":id")
  @HttpCode(204)
  public async deleteDirectory(
    @Param("id") id: string,
    @UserDecorator() user: User,
  ) {
    return await this.deleteDirectoryService.execute(id, user);
  }

  @Patch(":id/ops/rename")
  @HttpCode(204)
  public async renameDirectory(
    @Param("id") id: string,
    @Body() body: RenameDirectoryDto,
    @UserDecorator() user: User,
  ) {
    return await this.renameDirectoryService.execute(id, body, user);
  }

  @Patch(":id/ops/share")
  @HttpCode(204)
  public async shareDirectory(
    @Param("id") id: string,
    @UserDecorator() user: User,
    @Body() body: ShareDirectoryDto,
  ) {
    return await this.shareDirectoryService.execute(id, user, body);
  }
}
