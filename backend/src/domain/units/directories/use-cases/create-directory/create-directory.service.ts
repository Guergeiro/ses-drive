import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
import { FindOptions } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { CreateDirectoryDto } from "./create-directory.dto";

@Injectable()
export class CreateDirectoryService {
  private readonly directoryRepository: EntityRepository<Directory>;

  public constructor(
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
  ) {
    this.directoryRepository = directoryRepository;
  }

  public async execute({ path, name }: CreateDirectoryDto, user: User) {
    const directoryFilters: FindOptions<Directory>["filters"] = {
      CREATE: {
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

    const parent = await this.directoryRepository.findOneOrFail(
      {},
      { filters: directoryFilters },
    );

    const dir = this.directoryRepository.create({
      owner: user,
      fullpath: `${parent.fullpath}/${name}`,
      parent: parent,
      viewers: parent.viewers.getItems(),
      editors: parent.editors.getItems(),
    });

    await this.directoryRepository.persistAndFlush(dir);
    return dir;
  }
}
