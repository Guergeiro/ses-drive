import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
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
    if (path == null) {
      path = `/private/${user.email}`
    }

    const directory = await this.directoryRepository.findOneOrFail({
      fullpath: path,
      owner: user,
    });

    return directory;
  }
}
