import { Token } from "@entities/token.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@services/jwt/jwt.service";

@Injectable()
export class SignOutService {
  private readonly tokenRepository: EntityRepository<Token>;
  private readonly jwtService: JwtService;

  public constructor(
    @InjectRepository(Token) tokenRepository: EntityRepository<Token>,
    jwtService: JwtService,
  ) {
    this.tokenRepository = tokenRepository;
    this.jwtService = jwtService;
  }

  public async execute(tokenString?: string) {
    const user = await this.jwtService.validateToken(tokenString);

    if (user == null) {
      throw new UnauthorizedException();
    }

    const token = await this.tokenRepository.findOne({
      token: tokenString,
      type: "refresh",
      user: user,
    });

    if (token == null) {
      throw new UnauthorizedException();
    }

    const currentTime = new Date();
    if (currentTime.getTime() > token.expiresAt.getTime()) {
      throw new UnauthorizedException();
    }

    await this.tokenRepository.removeAndFlush(token);
  }
}
