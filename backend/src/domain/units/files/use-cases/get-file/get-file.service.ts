import { User } from "@entities/user.entity";
import { File } from "@entities/file.entity";
import { Injectable } from "@nestjs/common";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { FindOptions } from "@mikro-orm/core";

@Injectable()
export class GetFileService {
  private readonly fileRepository: EntityRepository<File>;

  public constructor(
    @InjectRepository(File) fileRepository: EntityRepository<File>,
  ) {
    this.fileRepository = fileRepository;
  }

  public async execute(id: string, user: User) {
    const fileFilters: FindOptions<File>["filters"] = {
      READ: {
        user: user,
      },
    };

    const file = await this.fileRepository.findOneOrFail(
      { id: id },
      { filters: fileFilters, populate: ["viewers", "editors"] },
    );

    return file;
  }
}
