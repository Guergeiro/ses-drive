import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { BothAuthGuard } from "@guards/both-auth.guard";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiSecurity, ApiBearerAuth } from "@nestjs/swagger";
import { CreateDirectoryDto } from "./use-cases/create-directory/create-directory.dto";
import { CreateDirectoryService } from "./use-cases/create-directory/create-directory.service";
import { GetDirectoriesDto } from "./use-cases/get-directories/get-directories.dto";
import { GetDirectoriesService } from "./use-cases/get-directories/get-directories.service";

@ApiTags("directories")
@ApiSecurity("x-api-key")
@ApiBearerAuth()
@UseGuards(BothAuthGuard)
@Controller("directories")
export class DirectoriesController {
  private readonly getDirectoriesService: GetDirectoriesService;
  private readonly createDirectoryService: CreateDirectoryService;

  public constructor(
    getDirectoriesService: GetDirectoriesService,
    createDirectoryService: CreateDirectoryService,
  ) {
    this.getDirectoriesService = getDirectoriesService;
    this.createDirectoryService = createDirectoryService;
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
}
