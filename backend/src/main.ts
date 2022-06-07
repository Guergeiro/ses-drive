import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as helmet from "helmet";
import "reflect-metadata";
import { AppModule } from "./app.module";
import { environment } from "./configs/environment";
import { Request } from "express";

async function bootstrap() {
  const env = await environment();

  const app = await NestFactory.create(AppModule, {
    logger:
      env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["error", "warn", "log", "debug", "verbose"],
    cors: function (req: Request, callback: any) {
      const config: cors.CorsOptions = { origin: "*" };
      if (req.path.startsWith(`/${env.host.PREFIX}/auth`)) {
        if (env.NODE_ENV === "development") {
          config.origin = `http://${env.host.APP_URL}:${env.host.APP_PORT}`;
        } else {
          config.origin = `https://${env.host.APP_URL}`;
        }
        config.credentials = true;
      }

      callback(null, config);
    },
  });

  app.setGlobalPrefix(env["host"]["PREFIX"], {
    exclude: ["/public", "/public/(.*)"],
  });
  app.enableShutdownHooks();

  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("Backend")
    .setVersion(`${env["host"]["VERSION"]}`)
    .addBearerAuth()
    .addApiKey({ type: "apiKey", name: "x-api-key", in: "header" }, "x-api-key")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(env.host.PORT, env.host.URL);
}
bootstrap().catch(console.error);
