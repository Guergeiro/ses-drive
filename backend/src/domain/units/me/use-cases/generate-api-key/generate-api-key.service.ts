import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";

@Injectable()
export class GenerateApiKeyService {
  private readonly userRepository: EntityRepository<User>;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
  ) {
    this.userRepository = userRepository;
  }

  public async execute(user: User) {
    user.apiKey = randomBytes(20).toString("hex");

    await this.userRepository.flush();
  }
}
