import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { AccessJwtAuthGuard } from "@guards/access-jwt.guard";
import { BothAuthGuard } from "@guards/both-auth.guard";
import { RecaptchaGuard } from "@guards/recaptcha.guard";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ChangePasswordDto } from "./use-cases/change-password/change-password.dto";
import { ChangePasswordService } from "./use-cases/change-password/change-password.service";
import { GenerateApiKeyService } from "./use-cases/generate-api-key/generate-api-key.service";

@ApiTags("me")
@Controller("me")
export class MeController {
  private readonly generateApiKeyService: GenerateApiKeyService;
  private readonly changePasswordService: ChangePasswordService;

  public constructor(
    generateApiKeyService: GenerateApiKeyService,
    changePasswordService: ChangePasswordService,
  ) {
    this.generateApiKeyService = generateApiKeyService;
    this.changePasswordService = changePasswordService;
  }

  @Get()
  @UseGuards(BothAuthGuard)
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  public getMe(@UserDecorator() user: User) {
    return user;
  }

  @Patch("/ops/generate-api-key")
  @ApiBearerAuth()
  @UseGuards(AccessJwtAuthGuard)
  @HttpCode(204)
  public async generateApiKey(@UserDecorator() user: User) {
    return await this.generateApiKeyService.execute(user);
  }

  @Patch("/ops/change-password")
  @ApiBearerAuth()
  @UseGuards(RecaptchaGuard, AccessJwtAuthGuard)
  @HttpCode(204)
  public async changePassword(
    @Body() body: ChangePasswordDto,
    @UserDecorator() user: User,
  ) {
    return await this.changePasswordService.execute(body, user);
  }
}
