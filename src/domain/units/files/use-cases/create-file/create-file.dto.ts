import { ApiProperty } from "@nestjs/swagger";

export class CreateFileDto {
  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
  })
  files: unknown[];
}
