import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ChangePasswordDto } from "./change-password.dto";

@Injectable()
export class ChangePasswordService {
  private readonly userRepository: EntityRepository<User>;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
  ) {
    this.userRepository = userRepository;
  }

  public async execute(
    { password, confirmPassword }: ChangePasswordDto,
    user: User,
  ) {
    if (password !== confirmPassword) {
      throw new BadRequestException();
    }
    user.password = password;

    await this.userRepository.persistAndFlush(user);
  }
}
