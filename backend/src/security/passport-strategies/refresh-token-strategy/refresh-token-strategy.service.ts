import { Token } from "@entities/token.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { SchedulerRegistry } from "@nestjs/schedule";
import { JwtService } from "@services/jwt/jwt.service";
import { Request } from "express";
import { Strategy, VerifiedCallback } from "passport-custom";

@Injectable()
export class RefreshTokenStrategyService extends PassportStrategy(
  Strategy,
  "refresh",
) {
  private readonly tokenRepository: EntityRepository<Token>;
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;
  private readonly scheduler: SchedulerRegistry;

  public constructor(
    @InjectRepository(Token) tokenRepository: EntityRepository<Token>,
    jwtService: JwtService,
    configService: ConfigService,
    scheduler: SchedulerRegistry,
  ) {
    super();
    this.tokenRepository = tokenRepository;
    this.jwtService = jwtService;
    this.configService = configService;
    this.scheduler = scheduler;
  }

  public async validate(request: Request, done: VerifiedCallback) {
    const tokenString: string = request.cookies["refresh_token"];
    if (tokenString == null) {
      return done(new UnauthorizedException(), null);
    }

    const user = await this.jwtService.validateToken(
      this.jwtService.decrypt(tokenString),
    );
    if (user == null) {
      return done(new UnauthorizedException(), null);
    }

    const refreshToken = await this.tokenRepository.findOne({
      token: this.jwtService.decrypt(tokenString),
      type: "refresh",
      user: user,
    });

    if (refreshToken == null) {
      return done(new UnauthorizedException(), null);
    }

    if (this.refreshTokenStillValid(refreshToken) === false) {
      return done(new UnauthorizedException(), null);
    }

    const timeoutName = `refresh_token_${refreshToken.id}`;
    const previousTimeout = this.scheduler.doesExist("timeout", timeoutName);
    if (previousTimeout === true) {
      return user;
    }

    this.scheduler.addTimeout(
      timeoutName,
      this.getRefreshTimeout(refreshToken.id),
    );

    await this.tokenRepository.flush();
    return done(null, user);
  }

  private getRefreshTimeout(tokenId: string) {
    const [lowerBound, upperBound] = this.getBounds();
    const timeoutInMs = Math.floor(Math.random() * upperBound + lowerBound);

    const timeout = setTimeout(async () => {
      const token = await this.tokenRepository.findOne({ id: tokenId });
      await this.tokenRepository.removeAndFlush(token);
    }, timeoutInMs);
    return timeout;
  }

  private refreshTokenStillValid(refreshToken: Token) {
    const currentTime = new Date();
    const [lowerBound, upperBound] = this.getBounds();
    if (
      currentTime.getTime() <=
      refreshToken.expiresAt.getTime() + lowerBound
    ) {
      // Inferior ao limite minimo
      return true;
    }
    if (currentTime.getTime() > refreshToken.expiresAt.getTime() + upperBound) {
      // Superior ao limite maximo
      return false;
    }
    // Entre os limites permitidos, provavelmente j? com remove incoming
    return true;
  }

  private getBounds() {
    const lowerBound = this.configService.get<number>(
      "auth.JWT_REFRESH_TIMOUT_LOWER_BOUND",
    );

    const upperBound = this.configService.get<number>(
      "auth.JWT_REFRESH_TIMOUT_UPPER_BOUND",
    );

    return [lowerBound, upperBound];
  }
}
