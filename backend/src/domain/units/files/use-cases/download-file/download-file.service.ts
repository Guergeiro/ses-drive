import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { AwsS3Service } from "@services/aws-s3/aws-s3.service";
import { Readable } from "stream";

@Injectable()
export class DownloadFileService {
  private readonly filesRepository: EntityRepository<File>;
  private readonly awsS3Service: AwsS3Service;

  public constructor(
    @InjectRepository(File) filesRepository: EntityRepository<File>,
    awsS3Service: AwsS3Service,
  ) {
    this.filesRepository = filesRepository;
    this.awsS3Service = awsS3Service;
  }

  public async execute(id: string, user: User) {
    const file = await this.filesRepository.findOneOrFail(
      {
        id: id,
      },
      {
        filters: {
          CASL_READ: {
            user: user,
          },
        },
      },
    );

    const { Body } = await this.awsS3Service.getObject(file);

    return {
      fileObj: file,
      buffer: Body as Readable,
    };
  }
}
