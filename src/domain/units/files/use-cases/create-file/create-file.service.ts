import { Injectable, UnsupportedMediaTypeException } from "@nestjs/common";

@Injectable()
export class CreateFileService {
  public async execute(files: Array<Express.Multer.File>) {
    if (Array.isArray(files) === false) {
      throw new UnsupportedMediaTypeException();
    }
    for (const file of files) {
      console.log(file);
    }
  }
}
