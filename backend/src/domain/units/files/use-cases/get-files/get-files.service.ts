import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { FilterQuery, FindOptions } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { GetFilesDto } from "./get-files.dto";

@Injectable()
export class GetFilesService {
  private readonly filesRepository: EntityRepository<File>;

  public constructor(
    @InjectRepository(File) filesRepository: EntityRepository<File>,
  ) {
    this.filesRepository = filesRepository;
  }

  public async execute({ path, name, shared }: GetFilesDto, user: User) {
    const filterQuery: FilterQuery<File> = {};

    if (shared === true) {
      filterQuery.owner = {
        $ne: user,
      };
    }
    const fileFilters: FindOptions<File>["filters"] = {
      READ: {
        user: user,
      },
      path: {
        path: `/private`,
      },
    };
    if (path != null) {
      fileFilters.path = {
        path: path,
      };
    }
    if (name != null) {
      fileFilters.name = {
        name: name,
      };
    }

    const files = await this.filesRepository.find(filterQuery, {
      filters: fileFilters,
    });
    return files;
  }
}
