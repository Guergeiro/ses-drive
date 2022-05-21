import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { AccessJwtAuthGuard } from "@guards/access-jwt.guard";
import { Controller, Get, HttpCode, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GenerateApiKeyService } from "./use-cases/generate-api-key/generate-api-key.service";

@ApiTags("me")
@ApiBearerAuth()
@UseGuards(AccessJwtAuthGuard)
@Controller("me")
export class MeController {
  private readonly generateApiKeyService: GenerateApiKeyService;

  public constructor(generateApiKeyService: GenerateApiKeyService) {
    this.generateApiKeyService = generateApiKeyService;
  }

  @Get()
  public getMe(@UserDecorator() user: User) {
    return user;
  }

  @Patch("/ops/generate-api-key")
  @HttpCode(204)
  public async generateApiKey(@UserDecorator() user: User) {
    await this.generateApiKeyService.execute(user);
  }
}
