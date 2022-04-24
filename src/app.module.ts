import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { environment } from "./configs/environment";
import { ThrottlerConfigService } from "./configs/ThrottlerConfigService";
import { SharedModule } from "./shared/shared.module";
import { DomainModule } from "./domain/domain.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MikroOrmConfigService } from "./configs/MikroOrmConfigService";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [environment],
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
      inject: [ConfigService],
    }),
    MikroOrmModule.forRootAsync({
      useClass: MikroOrmConfigService,
      inject: [ConfigService],
    }),
    SharedModule,
    DomainModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
