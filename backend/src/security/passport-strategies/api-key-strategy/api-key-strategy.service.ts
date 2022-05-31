import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy, VerifiedCallback } from "passport-custom";

@Injectable()
export class ApiKeyStrategyService extends PassportStrategy(
  Strategy,
  "api-key",
) {
  private readonly userRepository: EntityRepository<User>;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
  ) {
    super();
    this.userRepository = userRepository;
  }

  public async validate(request: Request, done: VerifiedCallback) {
    const apiKey = request.header("x-api-key");
    if (apiKey == null) {
      return done(new UnauthorizedException(), null);
    }
    const user = await this.userRepository.findOne({
      apiKey: apiKey,
    });
    if (user == null) {
      return done(new UnauthorizedException(), null);
    }
    return done(null, user);
  }
}
