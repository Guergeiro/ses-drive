import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { EntityRepository } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnsupportedMediaTypeException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AwsS3Service } from "@services/aws-s3/aws-s3.service";

@Injectable()
export class CreateFileService {
  private readonly filesRepository: EntityRepository<File>;
  private readonly awsS3Service: AwsS3Service;
  private readonly eventEmitter: EventEmitter2;

  public constructor(
    @InjectRepository(File) filesRepository: EntityRepository<File>,
    awsS3Service: AwsS3Service,
    eventEmitter: EventEmitter2,
  ) {
    this.filesRepository = filesRepository;
    this.awsS3Service = awsS3Service;
    this.eventEmitter = eventEmitter;
  }
  public async execute(files: Array<Express.Multer.File>, user: User) {
    if (Array.isArray(files) === false) {
      throw new UnsupportedMediaTypeException();
    }
    const filesArray = files.map(
      ({ fieldname, mimetype, originalname, buffer }) => {
        if (fieldname.endsWith("/") === true) {
          fieldname = fieldname.replace(new RegExp("/+$"), "");
        }
        const fileObj = this.filesRepository.create({
          fullpath: `${fieldname}/${originalname}`,
          owner: user,
          mimetype: mimetype,
        });

        const type = fieldname.split("/").shift();

        return { fileObj, buffer, type };
      },
    );

    await this.filesRepository.persistAndFlush(
      filesArray.map(function ({ fileObj }) {
        return fileObj;
      }),
    );

    this.awsS3Service.createFiles(filesArray).then(async (results) => {
      const outputArray = results.map(({ status }, index) => {
        const outObj: { fileObj: File; fulfilled: boolean } = {
          fileObj: filesArray[index].fileObj,
          fulfilled: status === "fulfilled",
        };
        if (outObj.fulfilled === false) {
          this.filesRepository.remove(outObj.fileObj);
        }
        return outObj;
      });
      await this.filesRepository.flush();
      this.eventEmitter.emit("files.created", outputArray);
    });
  }
}
