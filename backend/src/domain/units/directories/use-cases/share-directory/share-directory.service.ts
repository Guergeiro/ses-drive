import { Directory } from "@entities/directory.entity";
import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { Collection } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ShareDirectoryDto, Type } from "./share-directory.dto";

@Injectable()
export class ShareDirectoryService {
  private readonly userRepository: EntityRepository<User>;
  private readonly directoryRepository: EntityRepository<Directory>;
  private readonly filesRepository: EntityRepository<File>;

  public constructor(
    @InjectRepository(User)
    userRepository: EntityRepository<User>,
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
    @InjectRepository(File)
    filesRepository: EntityRepository<File>,
  ) {
    this.userRepository = userRepository;
    this.directoryRepository = directoryRepository;
    this.filesRepository = filesRepository;
  }

  public async execute(
    id: string,
    user: User,
    { type, userEmail }: ShareDirectoryDto,
  ) {
    const userToBeShared = await this.userRepository.findOneOrFail({
      email: userEmail,
    });

    const directory = await this.directoryRepository.findOneOrFail({
      id: id,
      owner: user,
    });

    switch (type) {
      case Type.VIEW:
        await this.handleViewShare(directory, userToBeShared);
        break;
      case Type.EDIT:
        await this.handleEditorsShare(directory, userToBeShared);
        break;
      case Type.REVOKE:
        await this.handleRevokeShare(directory, userToBeShared);
        break;
      default:
      /* intentionally empty */
    }

    await this.directoryRepository.persistAndFlush(directory);
  }

  private async handleViewShare(directory: Directory, userToBeShared: User) {
    await this.handleRevokeShare(directory, userToBeShared);
    directory.viewers.add(userToBeShared);
    await this.syncViewers(directory.fullpath, directory.viewers);
  }

  private async handleEditorsShare(directory: Directory, userToBeShared: User) {
    await this.handleRevokeShare(directory, userToBeShared);
    directory.editors.add(userToBeShared);
    await this.syncEditors(directory.fullpath, directory.editors);
  }

  private async handleRevokeShare(directory: Directory, userToBeShared: User) {
    await directory.viewers.init();
    if (directory.viewers.contains(userToBeShared) === true) {
      directory.viewers.remove(userToBeShared);
      await this.syncViewers(directory.fullpath, directory.viewers);
    }
    await directory.editors.init();
    if (directory.editors.contains(userToBeShared) === true) {
      directory.editors.remove(userToBeShared);
      await this.syncEditors(directory.fullpath, directory.editors);
    }
  }

  private async syncViewers(path: string, users: Collection<User>) {
    await this.syncPermissions<File>(
      path,
      { key: "viewers", users: users },
      this.filesRepository,
    );
    await this.syncPermissions<Directory>(
      path,
      { key: "viewers", users: users },
      this.directoryRepository,
    );
  }

  private async syncEditors(path: string, users: Collection<User>) {
    await this.syncPermissions<File>(
      path,
      { key: "editors", users: users },
      this.filesRepository,
    );
    await this.syncPermissions<Directory>(
      path,
      { key: "editors", users: users },
      this.directoryRepository,
    );
  }

  private async syncPermissions<T extends File | Directory>(
    path: string,
    { key, users }: { key: "viewers" | "editors"; users: Collection<User> },
    repo: EntityRepository<T>,
  ) {
    const fileSystem = await repo.findAll({
      filters: {
        path: {
          path: path,
        },
      },
    });

    for (const file of fileSystem) {
      file[key] = users;
    }

    repo.persist(fileSystem);
  }
}
