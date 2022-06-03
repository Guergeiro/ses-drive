import { File } from "@entities/file.entity";
import { FindOptions } from "@mikro-orm/core";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { AwsS3Service } from "@services/aws-s3/aws-s3.service";
import { writeFile } from "fs/promises";
import { Readable } from "stream";

@Injectable()
export class ServeFileService {
  private readonly filesRepository: EntityRepository<File>;
  private readonly awsS3Service: AwsS3Service;

  public constructor(
    @InjectRepository(File) filesRepository: EntityRepository<File>,
    awsS3Service: AwsS3Service,
  ) {
    this.filesRepository = filesRepository;
    this.awsS3Service = awsS3Service;
  }

  public async execute(path: string) {
    const fileFilters: FindOptions<File>["filters"] = {
      path: {
        path: path,
      },
    };

    const file = await this.filesRepository.findOneOrFail(
      {},
      { filters: fileFilters },
    );

    const { Body } = await this.awsS3Service.getObject(file);

    return await this.writeToFile(file, Body as Readable);
  }

  private async writeToFile(file: File, buffer: Readable) {
    const { id, name } = file;
    const [_, extension] = name.split(".");
    const outputName: string[] = [id];
    if (extension != null) {
      outputName.push(extension);
    }

    const finalName = `${process.cwd()}/${outputName.join(".")}`;

    await writeFile(finalName, buffer);

    return finalName;
  }
}
