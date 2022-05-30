import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { environment } from "./configs/environment";
import { ThrottlerConfigService } from "./configs/ThrottlerConfigService";
import { DomainModule } from "./domain/domain.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MikroOrmConfigService } from "./configs/MikroOrmConfigService";
import { ScheduleModule } from "@nestjs/schedule";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongoExceptionFilter } from "./shared/filters/mongo-exception.filter";
import { SecurityModule } from './security/security.module';

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
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DomainModule,
    SecurityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: MongoExceptionFilter,
    },
  ],
})
export class AppModule {}
