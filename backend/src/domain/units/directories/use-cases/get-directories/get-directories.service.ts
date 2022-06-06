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

  public async execute({ shared, ...rest }: GetDirectoriesDto, user: User) {
    console.log(shared);
    if (shared === true) {
      return await this.getSharedDirectories(rest, user);
    }
    return await this.getPrivateDirectories(rest, user);
  }

  private async getSharedDirectories(
    { path, name }: Omit<GetDirectoriesDto, "shared">,
    user: User,
  ) {
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
    const readDirectories = await this.directoryRepository.findAll({
      filters: directoryFilters,
    });

    const directories = await this.directoryRepository.find(
      {
        id: {
          $in: readDirectories.map((dir) => dir.id),
        },
        parent: {
          $nin: readDirectories.map((dir) => dir.id),
        },
      },
      { populate: ["folders", "files"] },
    );

    return directories;
  }

  private async getPrivateDirectories(
    { path, name }: Omit<GetDirectoriesDto, "shared">,
    user: User,
  ) {
    const directoryFilters: FindOptions<Directory>["filters"] = {
      READ: {
        user: user,
      },
      path: {
        path: `/private/${user.email}`,
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
    return await this.directoryRepository.findOneOrFail(
      {},
      {
        populate: ["folders", "files"],
        filters: directoryFilters,
      },
    );
  }
}
