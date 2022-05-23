import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import "reflect-metadata";
import { AppModule } from "./app.module";
import { environment } from "./configs/environment";

async function bootstrap() {
  const env = await environment();

  const app = await NestFactory.create(AppModule, {
    logger:
      env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["error", "warn", "log", "debug", "verbose"],
  });

  app.setGlobalPrefix(env["host"]["PREFIX"]);
  app.enableShutdownHooks();
  app.enableCors({ origin: "*" });

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
