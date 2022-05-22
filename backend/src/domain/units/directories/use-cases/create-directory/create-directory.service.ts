import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
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
    if (path == null) {
      path = `/private/${user.email}`;
    }

    const parent = await this.directoryRepository.findOneOrFail({
      fullpath: path,
      owner: user,
    });

    const dir = this.directoryRepository.create({
      owner: user,
      fullpath: `${parent.fullpath}/${name}`,
      parent: parent,
    });

    await this.directoryRepository.persistAndFlush(dir);
    return dir;
  }
}
