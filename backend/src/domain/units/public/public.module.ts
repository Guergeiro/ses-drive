import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { ServeFileService } from "./use-cases/serve-file/serve-file.service";
import { File } from "@entities/file.entity";
import { ServicesModule } from "@services/services.module";

@Module({
  controllers: [PublicController],
  imports: [MikroOrmModule.forFeature([File]), ServicesModule],
  providers: [ServeFileService],
})
export class PublicModule {}
