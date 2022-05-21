import { Token } from "@entities/token.entity";
import { User } from "@entities/user.entity";
import { Token as TokenType } from "@generics/Token";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService as Jwt } from "@nestjs/jwt";

@Injectable()
export class JwtService {
  private readonly userRepository: EntityRepository<User>;
  private readonly tokenRepository: EntityRepository<Token>;
  private readonly configService: ConfigService;
  private readonly jwt: Jwt;

  public constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    @InjectRepository(Token) tokenRepository: EntityRepository<Token>,
    configService: ConfigService,
    jwt: Jwt,
  ) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.configService = configService;
    this.jwt = jwt;
  }

  public async generateAccessToken({ id, tokenVersion }: User) {
    return await this.generateToken(
      { id: id, tokenVersion: tokenVersion },
      this.configService.get<number>("auth.JWT_ACCESS_EXPIRY_TIME"),
    );
  }

  public async generateRefreshToken(user: User) {
    const expireTimeInMs =
      this.configService.get<number>("auth.JWT_REFRESH_EXPIRY_TIME") * 1000;

    const expiresAt = new Date(new Date().getTime() + expireTimeInMs);

    const refresh_token = await this.generateToken(
      { id: user.id, tokenVersion: user.tokenVersion },
      expireTimeInMs / 1000,
    );

    const token = this.tokenRepository.create({
      type: "refresh",
      token: refresh_token,
      user: user,
      expiresAt: expiresAt,
    });
    await user.tokens.init();
    user.tokens.add(token);
    this.tokenRepository.persist(token);

    return { refresh_token, expiresAt };
  }

  public async validateToken(tokenString?: string) {
    try {
      if (tokenString == null) {
        return null;
      }

      const decodedString = Buffer.from(tokenString, "base64url").toString(
        "utf8",
      );
      const { id, tokenVersion } = await this.jwt.verifyAsync(decodedString);

      const user = await this.userRepository.findOne({
        id: id,
        tokenVersion: tokenVersion,
      });

      return user;
    } catch (err) {
      return null;
    }
  }

  private async generateToken(token: TokenType, expiration: number) {
    const tokenString = await this.jwt.signAsync(token, {
      expiresIn: expiration,
    });

    return Buffer.from(tokenString, "utf8").toString("base64url");
  }
}
