import { Test, TestingModule } from "@nestjs/testing";
import { MimeTypesService } from "./mime-types.service";

describe("MimeTypesService", () => {
  let service: MimeTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MimeTypesService],
    }).compile();

    service = module.get<MimeTypesService>(MimeTypesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
