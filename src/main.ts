import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
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
  app.enableCors({ credentials: true, origin: "*" });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle("Backend")
    .setVersion(`${env["host"]["VERSION"]}`)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(env.host.PORT, env.host.URL);
}
bootstrap().catch(console.error);
