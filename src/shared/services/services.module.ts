import { Token } from "@entities/token.entity";
import { User } from "@entities/user.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtService } from "./jwt/jwt.service";
import { AwsS3Service } from "./aws-s3/aws-s3.service";
import { MimeTypesService } from "./mime-types/mime-types.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    MikroOrmModule.forFeature([User, Token]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("auth.JWT_SECRET"),
      }),
      inject: [ConfigService],
    }),
    HttpModule.registerAsync({
      useFactory: async () => ({
        timeout: 5000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtService, AwsS3Service, MimeTypesService],
  exports: [JwtService, AwsS3Service, MimeTypesService],
})
export class ServicesModule {}
