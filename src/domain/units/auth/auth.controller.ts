import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SignUpDto } from "./use-cases/sign-up/sign-up.dto";
import { SignUpService } from "./use-cases/sign-up/sign-up.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly signUpService: SignUpService;

  public constructor(signUpService: SignUpService) {
    this.signUpService = signUpService;
  }

  @Post("sign-up")
  public async signUp(@Body() body: SignUpDto) {
    return await this.signUpService.execute(body);
  }

  @Post("sign-in")
  public async signIn() {}
}
