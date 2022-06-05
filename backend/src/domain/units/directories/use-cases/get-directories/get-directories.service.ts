import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
import { FilterQuery, FindOptions } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { GetDirectoriesDto } from "./get-directories.dto";

@Injectable()
export class GetDirectoriesService {
  private readonly directoryRepository: EntityRepository<Directory>;

  public constructor(
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
  ) {
    this.directoryRepository = directoryRepository;
  }

  public async execute({ path, name, shared }: GetDirectoriesDto, user: User) {
    const filterQuery: FilterQuery<Directory> = {};

    if (shared === true) {
      filterQuery.owner = {
        $ne: user,
      };
    }

    const directoryFilters: FindOptions<Directory>["filters"] = {
      READ: {
        user: user,
      },
      path: {
        path: `/private`,
      },
    };

    if (path != null) {
      directoryFilters.path = {
        path: path,
      };
    }
    if (name != null) {
      directoryFilters.name = {
        name: name,
      };
    }

    const directories = await this.directoryRepository.find(filterQuery, {
      populate: ["folders", "files"],
      filters: directoryFilters,
    });

    return directories;
  }
}
