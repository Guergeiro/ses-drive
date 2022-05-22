import { EntityRepository } from "@mikro-orm/mongodb";
import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "@entities/user.entity";
import { SignUpDto } from "./sign-up.dto";
import { InjectRepository } from "@mikro-orm/nestjs";
import { genSalt, hash } from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { Directory } from "@entities/directory.entity";

@Injectable()
export class SignUpService {
  private readonly userRepository: EntityRepository<User>;
  private readonly directoryRepository: EntityRepository<Directory>;
  private readonly configService: ConfigService;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
    configService: ConfigService,
  ) {
    this.userRepository = userRepository;
    this.directoryRepository = directoryRepository;
    this.configService = configService;
  }

  public async execute({ email, password }: SignUpDto) {
    const previousUser = await this.userRepository.findOne({ email: email });
    if (previousUser != null) {
      throw new BadRequestException();
    }

    const user = this.userRepository.create({
      email: email,
      password: `${password}:${this.configService.get<string>("auth.PEPPER")}`,
    });

    const salt = await genSalt(10);
    user.password = await hash(user.password, salt);
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
