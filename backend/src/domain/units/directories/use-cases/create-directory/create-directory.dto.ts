import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateDirectoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public readonly path?: string;

  @ApiProperty()
  @IsString()
  public readonly name: string;
}
