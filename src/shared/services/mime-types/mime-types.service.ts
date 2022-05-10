import { HttpService } from "@nestjs/axios";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

type DbJson = Record<
  string,
  {
    source?: "apache" | "iana" | "nginx";
    extensions?: string[];
    compressible?: boolean;
    charset?: string;
  }
>;

@Injectable()
export class MimeTypesService implements OnModuleInit {
  private readonly http: HttpService;
  private readonly dbUrl =
    "https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json";

  private readonly extensionToMimeTypes = new Map<string, string[]>();
  private readonly mimeTypeToExtension = new Map<string, string[]>();

  public constructor(http: HttpService) {
    this.http = http;
  }

  public async onModuleInit() {
    try {
      const { data } = await lastValueFrom(this.http.get<DbJson>(this.dbUrl));

      for (const [mikeType, value] of Object.entries(data)) {
        if (value?.extensions == null) {
          continue;
        }

        this.mimeTypeToExtension.set(mikeType, value.extensions);

        for (const extension of value.extensions) {
          const mimes = this.extensionToMimeTypes.get(extension) || [];
          mimes.push(mikeType);
          this.extensionToMimeTypes.set(extension, [...new Set(mimes)]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  public getMimeTypesByExtension(extension: string) {
    return this.extensionToMimeTypes.get(extension);
  }

  public getExtensionsByMimeType(mimeType: string) {
    return this.mimeTypeToExtension.get(mimeType);
  }
}
