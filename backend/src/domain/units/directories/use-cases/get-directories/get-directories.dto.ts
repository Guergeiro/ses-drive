import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetDirectoriesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  public readonly path?: string;
}
