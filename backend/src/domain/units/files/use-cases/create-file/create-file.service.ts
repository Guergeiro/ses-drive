import { Directory } from "@entities/directory.entity";
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
  private readonly directoryRepository: EntityRepository<Directory>;
  private readonly awsS3Service: AwsS3Service;
  private readonly eventEmitter: EventEmitter2;

  public constructor(
    @InjectRepository(File) filesRepository: EntityRepository<File>,
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
    awsS3Service: AwsS3Service,
    eventEmitter: EventEmitter2,
  ) {
    this.filesRepository = filesRepository;
    this.directoryRepository = directoryRepository;
    this.awsS3Service = awsS3Service;
    this.eventEmitter = eventEmitter;
  }

  public async execute(files: Array<Express.Multer.File>, user: User) {
    if (Array.isArray(files) === false) {
      throw new UnsupportedMediaTypeException();
    }
    const filesArray: Array<{ fileObj: File; buffer: Buffer; type: string }> =
      [];

    for (const { fieldname, mimetype, originalname, buffer } of files) {
      const directory = await this.directoryRepository.findOneOrFail({
        fullpath: fieldname,
        owner: user,
      });
      const fileObj = this.filesRepository.create({
        fullpath: `${directory.fullpath}/${originalname}`,
        owner: user,
        mimetype: mimetype,
        folder: directory,
      });
      const splittedPath = directory.fullpath.split("/");
      splittedPath.shift();
      const type = splittedPath.shift(); // Either /public /private
      filesArray.push({ fileObj, buffer, type });
    }

    const results = await this.awsS3Service.createFiles(filesArray);
    const outputArray = results.map(({ status }, index) => {
      const outObj: { fileObj: File; fulfilled: boolean } = {
        fileObj: filesArray[index].fileObj,
        fulfilled: status === "fulfilled",
      };
      if (outObj.fulfilled === true) {
        this.filesRepository.persist(outObj.fileObj);
      }
      return outObj;
    });
    await this.filesRepository.flush();
    return outputArray;
  }
}
