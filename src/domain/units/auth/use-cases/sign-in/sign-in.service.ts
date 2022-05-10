import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@services/jwt/jwt.service";
import { compare } from "bcrypt";
import { SignInDto } from "./sign-in.dto";

@Injectable()
export class SignInService {
  private readonly userRepository: EntityRepository<User>;
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.configService = configService;
  }

  public async execute({ email, password }: SignInDto) {
    const user = await this.userRepository.findOneOrFail({
      email: email,
    });

    const passwordToCompare = `${password}:${this.configService.get<string>(
      "auth.PEPPER",
    )}`;

    if ((await compare(passwordToCompare, user.password)) === false) {
      throw new UnauthorizedException();
    }

    const tokens = {
      accessToken: await this.jwtService.generateAccessToken(user),
      refreshToken: await this.jwtService.generateRefreshToken(user),
    };

    await this.userRepository.flush();
    return tokens;
  }
}
