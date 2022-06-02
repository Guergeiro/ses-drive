import { Controller, Get, Param, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiExcludeController } from "@nestjs/swagger";
import { Response } from "express";
import { ServeFileService } from "./use-cases/serve-file/serve-file.service";

@ApiExcludeController()
@Controller("public")
export class PublicController {
  private readonly configService: ConfigService;
  private readonly serveFileService: ServeFileService;

  public constructor(
    configService: ConfigService,
    serveFileService: ServeFileService,
  ) {
    this.configService = configService;
    this.serveFileService = serveFileService;
  }

  @Get()
  public redirect(@Res() response: Response) {
    const baseUrl = this.configService.get<string>("host.APP_URL");
    if (this.configService.get<string>("NODE_ENV") === "development") {
      const port = this.configService.get<number>("host.APP_PORT");
      return response.redirect(`http://${baseUrl}:${port}`);
    }
    return response.redirect(`https://${baseUrl}`);
  }

  @Get("*")
  public async serve(@Res() response: Response, @Param("0") path: string) {
    const filename = await this.serveFileService.execute(`/public/${path}`);
    response.sendFile(filename);
  }
}
