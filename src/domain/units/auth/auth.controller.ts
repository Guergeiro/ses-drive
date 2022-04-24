import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { RefreshService } from "./use-cases/refresh/refresh.service";
import { SignInDto } from "./use-cases/sign-in/sign-in.dto";
import { SignInService } from "./use-cases/sign-in/sign-in.service";
import { SignUpDto } from "./use-cases/sign-up/sign-up.dto";
import { SignUpService } from "./use-cases/sign-up/sign-up.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly configService: ConfigService;
  private readonly signUpService: SignUpService;
  private readonly signInService: SignInService;
  private readonly refreshService: RefreshService;

  public constructor(
    configService: ConfigService,
    signUpService: SignUpService,
    signInService: SignInService,
    refreshService: RefreshService,
  ) {
    this.configService = configService;
    this.signUpService = signUpService;
    this.signInService = signInService;
    this.refreshService = refreshService;
  }

  @Post("sign-up")
  public async signUp(@Body() body: SignUpDto) {
    return await this.signUpService.execute(body);
  }

  @Post("sign-in")
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

  @Get("refresh")
  public async refresh(@Req() request: Request) {
    try {
      const tokens = await this.refreshService.execute(
        request.cookies["refresh_token"],
      );

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
    const cookie = {
      httpOnly: true,
      expiresAt: expiresAt.toUTCString(),
      secure: this.configService.get<string>("NODE_ENV") !== "development",
    };

    request.res.cookie("refresh_token", refreshToken, {
      ...cookie,
      path: `/${this.configService.get<string>("host.PREFIX")}/auth/refresh`,
    });
  }

  private clearResponseRefreshToken(request: Request) {
    request.res.clearCookie("refresh_token");
  }
}
