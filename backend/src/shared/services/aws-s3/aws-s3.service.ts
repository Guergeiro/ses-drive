import { S3, S3ClientConfig } from "@aws-sdk/client-s3";
import { File } from "@entities/file.entity";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type S3RequiredFile = {
  fileObj: File;
  buffer: Buffer;
  type: string;
};

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

  public createFiles(files: Array<S3RequiredFile>) {
    const promises = files.map((file) => {
      return this.createFile(file);
    });
    return Promise.allSettled(promises);
  }

  public createFile({ fileObj, buffer, type }: S3RequiredFile) {
    return this.client.putObject({
      Body: buffer,
      Bucket: type,
      Key: fileObj.id,
    });
  }

  public getObjects(files: Array<File>) {
    const promises = files.map((file) => {
      return this.getObject(file);
    });
    return Promise.allSettled(promises);
  }

  public getObject(file: File) {
    return this.client.getObject({ Key: file.id, Bucket: file.scope });
  }
}
