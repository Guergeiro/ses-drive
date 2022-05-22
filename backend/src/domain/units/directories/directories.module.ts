import { Directory } from "@entities/directory.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { DirectoriesController } from "./directories.controller";
import { CreateDirectoryService } from "./use-cases/create-directory/create-directory.service";
import { GetDirectoriesService } from './use-cases/get-directories/get-directories.service';

@Module({
  controllers: [DirectoriesController],
  imports: [MikroOrmModule.forFeature([Directory])],
  providers: [CreateDirectoryService, GetDirectoriesService],
})
export class DirectoriesModule {}
