import { Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateFileService } from "./use-cases/create-file/create-file.service";

@ApiBearerAuth()
@ApiTags("file")
@Controller("file")
export class FileController {
  private readonly createFileService: CreateFileService;

  public constructor(createFileService: CreateFileService) {
    this.createFileService = createFileService;
  }

  @Post()
  public async create() {
    return await this.createFileService.execute();
  }
}
