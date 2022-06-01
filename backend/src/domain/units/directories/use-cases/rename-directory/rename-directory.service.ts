import { Directory } from "@entities/directory.entity";
import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { FindOptions } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { RenameDirectoryDto } from "./rename-directory.dto";

@Injectable()
export class RenameDirectoryService {
  private readonly directoryRepository: EntityRepository<Directory>;
  private readonly fileRepository: EntityRepository<File>;

  public constructor(
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
    @InjectRepository(File) fileRepository: EntityRepository<File>,
  ) {
    this.directoryRepository = directoryRepository;
    this.fileRepository = fileRepository;
  }

  public async execute(id: string, { name }: RenameDirectoryDto, user: User) {
    const directoryFilters: FindOptions<Directory>["filters"] = {
      UPDATE: {
        user: user,
      },
    };
    const directory = await this.directoryRepository.findOneOrFail(
      {
        id: id,
      },
      { filters: directoryFilters },
    );

    directory.name = name;

    await this.renameFolders(directory.folders, directory.fullpath);
    await this.renameFiles(directory.files, directory.fullpath);

    await this.directoryRepository.flush();
  }

  private async renameFolders(folders: Directory["folders"], basePath: string) {
    await folders.init();
    for (const folder of folders) {
      await this.renameFolder(folder, basePath);
    }
  }

  private async renameFiles(files: Directory["files"], basePath: string) {
    await files.init();
    for (const file of files) {
      this.renameFile(file, basePath);
    }
  }

  private async renameFolder(dir: Directory, basePath: string) {
    this.rename(dir, basePath);
    await this.renameFolders(dir.folders, dir.fullpath);

    await this.renameFiles(dir.files, dir.fullpath);

    this.directoryRepository.persist(dir);
  }

  private renameFile(file: File, basePath: string) {
    this.rename(file, basePath);
    this.fileRepository.persist(file);
  }

  private rename(fileSystem: Directory | File, basePath: string) {
    const name = fileSystem.name;
    fileSystem.fullpath = `${basePath}/${name}`;
  }
}
