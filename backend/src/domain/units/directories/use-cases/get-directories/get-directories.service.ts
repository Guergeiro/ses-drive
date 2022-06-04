import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
import { FindOptions } from "@mikro-orm/core";
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

  public async execute({ path }: GetDirectoriesDto, user: User) {
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

    const directory = await this.directoryRepository.findOneOrFail(
      {},
      { populate: ["folders", "files"], filters: directoryFilters },
    );

    return directory;
  }
}
