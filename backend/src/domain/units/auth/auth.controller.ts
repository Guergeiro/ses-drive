import { User } from "@entities/user.entity";
import { UserDecorator } from "@generics/User.decorator";
import { RecaptchaGuard } from "@guards/recaptcha.guard";
import { RefreshJwtAuthGuard } from "@guards/refresh-jwt.guard";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { CookieOptions, Request } from "express";
import { RefreshService } from "./use-cases/refresh/refresh.service";
import { SignInDto } from "./use-cases/sign-in/sign-in.dto";
import { SignInService } from "./use-cases/sign-in/sign-in.service";
import { SignOutService } from "./use-cases/sign-out/sign-out.service";
import { SignUpDto } from "./use-cases/sign-up/sign-up.dto";
import { SignUpService } from "./use-cases/sign-up/sign-up.service";

@ApiTags("authentication")
@Controller("auth")
export class AuthController {
  private readonly refreshPaths = ["refresh", "sign-out"];
  private readonly configService: ConfigService;
  private readonly signUpService: SignUpService;
  private readonly signInService: SignInService;
  private readonly signOutService: SignOutService;
  private readonly refreshService: RefreshService;

  public constructor(
    configService: ConfigService,
    signUpService: SignUpService,
    signInService: SignInService,
    signOutService: SignOutService,
    refreshService: RefreshService,
  ) {
    this.configService = configService;
    this.signUpService = signUpService;
    this.signInService = signInService;
    this.signOutService = signOutService;
    this.refreshService = refreshService;
  }

  @Post("sign-up")
  @UseGuards(RecaptchaGuard)
  public async signUp(@Body() body: SignUpDto) {
    return await this.signUpService.execute(body);
  }

  @Post("sign-in")
  @UseGuards(RecaptchaGuard)
  public async signIn(@Req() request: Request, @Body() body: SignInDto) {
    const tokens = await this.signInService.execute(body);
    const { refreshToken, ...rest } = tokens;
    this.setResponseRefreshToken(
      request,
      refreshToken.refresh_token,
      refreshToken.expiresAt,
    );
    return rest;
  }

  @Post("sign-out")
  @HttpCode(204)
  public async signOut(@Req() request: Request) {
    try {
      await this.signOutService.execute(request.cookies["refresh_token"]);
    } finally {
      this.clearResponseRefreshToken(request);
    }
  }

  @Get("refresh")
  @UseGuards(RefreshJwtAuthGuard)
  public async refresh(@Req() request: Request, @UserDecorator() user: User) {
    try {
      const tokens = await this.refreshService.execute(user);

      const { refreshToken, ...rest } = tokens;

      if (refreshToken != null) {
        this.setResponseRefreshToken(
          request,
          refreshToken.refresh_token,
          refreshToken.expiresAt,
        );
      }
      return rest;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        this.clearResponseRefreshToken(request);
      }
      throw err;
    }
  }

  private setResponseRefreshToken(
    request: Request,
    refreshToken: string,
    expiresAt: Date,
  ) {
    const cookie: CookieOptions = {
      httpOnly: true,
      expires: expiresAt,
      secure: this.configService.get<string>("NODE_ENV") !== "development",
      sameSite: "none",
    };

    for (const path of this.refreshPaths) {
      request.res.cookie("refresh_token", refreshToken, {
        ...cookie,
        path: `/${this.configService.get<string>("host.PREFIX")}/auth/${path}`,
      });
    }
  }

  private clearResponseRefreshToken(request: Request) {
    for (const path of this.refreshPaths) {
      request.res.clearCookie("refresh_token", {
        path: `/${this.configService.get<string>("host.PREFIX")}/auth/${path}`,
      });
    }
  }
}
