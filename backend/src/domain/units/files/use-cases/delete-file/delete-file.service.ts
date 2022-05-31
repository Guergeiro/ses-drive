import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { FindOptions } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeleteFileService {
  private readonly fileRepository: EntityRepository<File>;

  public constructor(
    @InjectRepository(File) fileRepository: EntityRepository<File>,
  ) {
    this.fileRepository = fileRepository;
  }

  public async execute(id: string, user: User) {
    const fileFilters: FindOptions<File>["filters"] = {
      DELETE: {
        user: user,
      },
    };

    const file = await this.fileRepository.findOneOrFail(
      { id: id },
      { filters: fileFilters },
    );
    await this.fileRepository.removeAndFlush(file);
  }
}
