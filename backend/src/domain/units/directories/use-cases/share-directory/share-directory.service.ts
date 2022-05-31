import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ShareDirectoryDto, Type } from "./share-directory.dto";

@Injectable()
export class ShareDirectoryService {
  private readonly userRepository: EntityRepository<User>;
  private readonly directoryRepository: EntityRepository<Directory>;

  public constructor(
    @InjectRepository(User)
    userRepository: EntityRepository<User>,
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
  ) {
    this.userRepository = userRepository;
    this.directoryRepository = directoryRepository;
  }

  public async execute(
    id: string,
    user: User,
    { type, userId }: ShareDirectoryDto,
  ) {
    const userToBeShared = await this.userRepository.findOneOrFail({
      id: userId,
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
  }

  private async handleEditorsShare(directory: Directory, userToBeShared: User) {
    await this.handleRevokeShare(directory, userToBeShared);
    directory.editors.add(userToBeShared);
  }

  private async handleRevokeShare(directory: Directory, userToBeShared: User) {
    await directory.viewers.init();
    if (directory.viewers.contains(userToBeShared) === true) {
      directory.viewers.remove(userToBeShared);
    }
    await directory.editors.init();
    if (directory.editors.contains(userToBeShared) === true) {
      directory.editors.remove(userToBeShared);
    }
  }
}
