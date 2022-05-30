import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ShareFileDto, Type } from "./share-file.dto";
import { File } from "@entities/file.entity";

@Injectable()
export class ShareFileService {
  private readonly userRepository: EntityRepository<User>;
  private readonly fileRepository: EntityRepository<File>;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    @InjectRepository(File) fileRepository: EntityRepository<File>,
  ) {
    this.userRepository = userRepository;
    this.fileRepository = fileRepository;
  }

  public async execute(id: string, user: User, { type, userId }: ShareFileDto) {
    const userToBeShared = await this.userRepository.findOneOrFail({
      id: userId,
    });
    const file = await this.fileRepository.findOneOrFail({
      id: id,
      owner: user,
    });

    switch (type) {
      case Type.VIEW:
        await this.handleViewShare(file, userToBeShared);
        break;
      case Type.EDIT:
        await this.handleEditorsShare(file, userToBeShared);
        break;
      case Type.REVOKE:
        await this.handleRevokeShare(file, userToBeShared);
        break;
      default:
      /* intentionally empty */
    }

    await this.fileRepository.persistAndFlush(file);
  }

  private async handleViewShare(file: File, userToBeShared: User) {
    await file.viewers.init();
    if (file.viewers.contains(userToBeShared) === false) {
      file.viewers.add(userToBeShared);
    }
  }

  private async handleEditorsShare(file: File, userToBeShared: User) {
    await file.editors.init();
    if (file.editors.contains(userToBeShared) === false) {
      file.editors.add(userToBeShared);
    }
  }

  private async handleRevokeShare(file: File, userToBeShared: User) {
    await file.viewers.init();
    if (file.viewers.contains(userToBeShared) === true) {
      file.viewers.remove(userToBeShared);
    }
    await file.editors.init();
    if (file.editors.contains(userToBeShared) === true) {
      file.editors.remove(userToBeShared);
    }
  }
}
