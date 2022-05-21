import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

type RecapthaResponse = {
  success: boolean; // whether this request was a valid reCAPTCHA token for your site
  score: number; // the score for this request (0.0 - 1.0)
  action: string; // the action name for this request (important to verify)
  challenge_ts: string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname: string; // the hostname of the site where the reCAPTCHA was solved
  "error-codes": string[]; // optional
};

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly configService: ConfigService;

  public constructor(configService: ConfigService) {
    this.configService = configService;
  }

  public async canActivate(context: ExecutionContext) {
    if (this.configService.get<string>("NODE_ENV") === "development") {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const { body } = request;
    const secret = this.configService.get<string>("recaptcha.SECRET");

    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${body.recaptchaToken}`,
      { method: "POST" },
    );

    const data: RecapthaResponse = await res.json();
    if (data.success !== true) {
      return false;
    }
    if (data.action !== body.recaptchaAction) {
      return false;
    }
    const score = this.configService.get<number>("recaptcha.MIN_SCORE");
    if (data.score < score) {
      return false;
    }

    return true;
  }
}
