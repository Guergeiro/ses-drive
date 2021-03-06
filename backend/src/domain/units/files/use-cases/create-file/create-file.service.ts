import { Directory } from "@entities/directory.entity";
import { File } from "@entities/file.entity";
import { User } from "@entities/user.entity";
import { FindOptions } from "@mikro-orm/core";
import { EntityRepository, ObjectId } from "@mikro-orm/mongodb";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnsupportedMediaTypeException } from "@nestjs/common";
import { AwsS3Service, S3RequiredFile } from "@services/aws-s3/aws-s3.service";

@Injectable()
export class CreateFileService {
  private readonly filesRepository: EntityRepository<File>;
  private readonly directoryRepository: EntityRepository<Directory>;
  private readonly awsS3Service: AwsS3Service;

  public constructor(
    @InjectRepository(File) filesRepository: EntityRepository<File>,
    @InjectRepository(Directory)
    directoryRepository: EntityRepository<Directory>,
    awsS3Service: AwsS3Service,
  ) {
    this.filesRepository = filesRepository;
    this.directoryRepository = directoryRepository;
    this.awsS3Service = awsS3Service;
  }

  public async execute(files: Array<Express.Multer.File>, user: User) {
    if (Array.isArray(files) === false) {
      throw new UnsupportedMediaTypeException();
    }
    const filesArray: Array<S3RequiredFile> = [];
    const directoryFilters: FindOptions<Directory>["filters"] = {
      CREATE: {
        user: user,
      },
    };

    for (const { fieldname, mimetype, originalname, buffer } of files) {
      const directory = await this.directoryRepository.findOneOrFail(
        {
          fullpath: fieldname,
        },
        { filters: directoryFilters },
      );
      const fileObj = this.filesRepository.create({
        _id: new ObjectId(),
        fullpath: `${directory.fullpath}/${originalname}`,
        owner: user,
        mimetype: mimetype,
        folder: directory,
        viewers: directory.viewers.getItems(),
        editors: directory.editors.getItems(),
      });
      filesArray.push({ fileObj, buffer, scope: directory.scope });
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
