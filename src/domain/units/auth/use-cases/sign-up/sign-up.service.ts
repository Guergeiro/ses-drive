import { EntityRepository } from "@mikro-orm/mongodb";
import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "@entities/user.entity";
import { SignUpDto } from "./sign-up.dto";
import { InjectRepository } from "@mikro-orm/nestjs";
import { genSalt, hash } from "bcrypt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SignUpService {
  private readonly userRepository: EntityRepository<User>;
  private readonly configService: ConfigService;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    configService: ConfigService,
  ) {
    this.userRepository = userRepository;
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

    await this.userRepository.persistAndFlush(user);

    return user;
  }
}
