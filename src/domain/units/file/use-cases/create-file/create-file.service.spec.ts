import { Test, TestingModule } from "@nestjs/testing";
import { CreateFileService } from "./create-file.service";

describe("CreateFileService", () => {
  let service: CreateFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateFileService],
    }).compile();

    service = module.get<CreateFileService>(CreateFileService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
