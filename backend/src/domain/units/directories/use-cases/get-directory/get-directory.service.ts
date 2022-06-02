import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
import { FindOptions } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetDirectoryService {
  private readonly directoryRepository: EntityRepository<Directory>;

  public constructor(
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
  ) {
    this.directoryRepository = directoryRepository;
  }

  public async execute(id: string, user: User) {
    const directoryFilters: FindOptions<Directory>["filters"] = {
      READ: {
        user: user,
      },
    };
    const directory = await this.directoryRepository.findOneOrFail(
      {
        id: id,
      },
      { filters: directoryFilters, populate: ["viewers", "editors"] },
    );
    return directory;
  }
}
