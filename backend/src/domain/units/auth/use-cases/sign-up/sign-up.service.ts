import { Directory } from "@entities/directory.entity";
import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { SignUpDto } from "./sign-up.dto";

@Injectable()
export class SignUpService {
  private readonly userRepository: EntityRepository<User>;
  private readonly directoryRepository: EntityRepository<Directory>;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
  ) {
    this.userRepository = userRepository;
    this.directoryRepository = directoryRepository;
  }

  public async execute({
    email,
    password,
    confirmPassword,
    fullName,
    terms,
  }: SignUpDto) {
    if (terms === false) {
      throw new BadRequestException();
    }

    if (password !== confirmPassword) {
      throw new BadRequestException();
    }

    const previousUser = await this.userRepository.findOne({ email: email });
    if (previousUser != null) {
      throw new BadRequestException();
    }

    const user = this.userRepository.create({
      name: fullName,
      email: email,
      password: password,
    });

    this.userRepository.persist(user);

    const publicDir = await this.directoryRepository.findOneOrFail({
      fullpath: "/public",
    });
    const privateDir = await this.directoryRepository.findOneOrFail({
      fullpath: "/private",
    });
    await this.directoryRepository.persistAndFlush([
      this.directoryRepository.create({
        fullpath: `${publicDir.fullpath}/${user.email}`,
        parent: publicDir,
        owner: user,
      }),
      this.directoryRepository.create({
        fullpath: `${privateDir.fullpath}/${user.email}`,
        parent: privateDir,
        owner: user,
      }),
    ]);

    return user;
  }
}
