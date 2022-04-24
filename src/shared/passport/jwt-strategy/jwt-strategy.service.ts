import { User } from "@entities/user.entity";
import { Token } from "@generics/Token";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  private readonly userRepository: EntityRepository<User>;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: function (request: Request) {
        const header = request.get("Authorization");
        if (header == null) {
          return null;
        }

        const [key, value] = header.split(" ", 2);
        if (key !== "Bearer") {
          return null;
        }
        if (value == null) {
          return null;
        }

        return Buffer.from(value, "base64url").toString("utf8");
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("auth.JWT_SECRET"),
    });
    this.userRepository = userRepository;
  }

  public async validate({ id, tokenVersion }: Token) {
    const user = await this.userRepository.findOne({
      id: id,
      tokenVersion: tokenVersion,
    });
    return user;
  }
}
