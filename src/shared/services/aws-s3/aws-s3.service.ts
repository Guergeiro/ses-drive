import { S3, S3ClientConfig } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AwsS3Service {
  private readonly client: S3;

  public constructor(configService: ConfigService) {
    const s3Config: S3ClientConfig = {
      region: configService.get<string>("aws.REGION"),
      credentials: {
        accessKeyId: configService.get<string>("aws.SECRET_KEY"),
        secretAccessKey: configService.get<string>("aws.ACCESS_KEY"),
      },
    };
    const isProduction =
      configService.get<string>("NODE_ENV") !== "development";

    if (isProduction === false) {
      s3Config.endpoint = "http://localstack:4566";
      s3Config.forcePathStyle = true;
      s3Config.tls = false;
    }

    this.client = new S3(s3Config);
  }

  public async listFiles() {
    const response = await this.client.createBucket({
      Bucket: "sup",
      ACL: "private",
    });
    return response;
  }
}
