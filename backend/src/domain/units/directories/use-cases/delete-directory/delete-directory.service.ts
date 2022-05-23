import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeleteDirectoryService {
  private readonly directoryRepository: EntityRepository<Directory>;

  public constructor(
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
  ) {
    this.directoryRepository = directoryRepository;
  }

  public async execute(id: string, user: User) {
    const directory = await this.directoryRepository.findOneOrFail({
      id: id,
      owner: user,
    });

    await this.directoryRepository.removeAndFlush(directory);
  }
}
