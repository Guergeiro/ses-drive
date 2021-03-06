import {
  MikroOrmOptionsFactory,
  MikroOrmModuleOptions,
} from "@mikro-orm/nestjs";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MikroOrmConfigService implements MikroOrmOptionsFactory {
  private readonly configService: ConfigService;

  public constructor(configService: ConfigService) {
    this.configService = configService;
  }

  public createMikroOrmOptions(): MikroOrmModuleOptions {
    const host = this.configService.get<string>("database.HOST");
    const user = this.configService.get<string>("database.USER");
    const password = this.configService.get<string>("database.PASSWORD");
    const dbName = this.configService.get<string>("database.NAME");

    return {
      type: "mongo",
      clientUrl: `${host}?retryWrites=true&w=majority`,
      user: user,
      password: password,
      dbName: dbName,
      debug: this.configService.get<string>("NODE_ENV") === "development",
      entities: ["dist/domain/entities"],
      entitiesTs: ["src/domain/entities"],
      metadataProvider: TsMorphMetadataProvider,
      implicitTransactions: true,
      ensureIndexes: true,
      forceUtcTimezone: true,
      findOneOrFailHandler: function (entityName) {
        return new NotFoundException(`${entityName} not found`);
      },
      forceEntityConstructor: true,
      forceUndefined: true,
      validate: true,
      strict: true,
    };
  }
}
