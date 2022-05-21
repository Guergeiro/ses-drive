import { Token } from "@entities/token.entity";
import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@services/jwt/jwt.service";

@Injectable()
export class RefreshService {
  private readonly tokenRepository: EntityRepository<Token>;
  private readonly jwtService: JwtService;

  public constructor(
    @InjectRepository(Token) tokenRepository: EntityRepository<Token>,
    jwtService: JwtService,
  ) {
    this.tokenRepository = tokenRepository;
    this.jwtService = jwtService;
  }

  public async execute(user: User) {
    const credentials: {
      accessToken: string;
      refreshToken?: { refresh_token: string; expiresAt: Date };
    } = {
      accessToken: await this.jwtService.generateAccessToken(user),
      refreshToken: await this.jwtService.generateRefreshToken(user),
    };

    await this.tokenRepository.flush();
    return credentials;
  }
}
