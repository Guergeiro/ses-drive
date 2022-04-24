import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@services/jwt/jwt.service";
import { compare } from "bcrypt";
import { SignInDto } from "./sign-in.dto";

@Injectable()
export class SignInService {
  private readonly userRepository: EntityRepository<User>;
  private readonly jwtService: JwtService;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    jwtService: JwtService,
  ) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
  }

  public async execute({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({
      email: email,
    });
    if (user == null) {
      throw new NotFoundException();
    }

    if ((await compare(password, user.password)) === false) {
      throw new UnauthorizedException();
    }

    const tokens = {
      accessToken: await this.jwtService.generateAcessToken(user),
      refreshToken: await this.jwtService.generateRefreshToken(user),
    };
    await this.userRepository.flush();
    return tokens;
  }
}
