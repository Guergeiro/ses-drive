import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { BothAuthGuard } from "@guards/both-auth.guard";
import { Controller, Get, HttpCode, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { GenerateApiKeyService } from "./use-cases/generate-api-key/generate-api-key.service";

@ApiTags("me")
@ApiSecurity("x-api-key")
@ApiBearerAuth()
@UseGuards(BothAuthGuard)
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
