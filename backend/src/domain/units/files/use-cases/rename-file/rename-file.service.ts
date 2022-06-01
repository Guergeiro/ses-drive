import { User } from "@entities/user.entity";
import { File } from "@entities/file.entity";
import { Injectable } from "@nestjs/common";
import { RenameFileDto } from "./rename-file.dto";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mongodb";
import { FindOptions } from "@mikro-orm/core";

@Injectable()
export class RenameFileService {
  private readonly fileRepository: EntityRepository<File>;

  public constructor(
    @InjectRepository(File) fileRepository: EntityRepository<File>,
  ) {
    this.fileRepository = fileRepository;
  }

  public async execute(id: string, { name }: RenameFileDto, user: User) {
    const fileFilters: FindOptions<File>["filters"] = {
      UPDATE: {
        user: user,
      },
    };
    const file = await this.fileRepository.findOneOrFail(
      { id: id },
      { filters: fileFilters },
    );

    file.name = name;

    await this.fileRepository.persistAndFlush(file);
  }
}
