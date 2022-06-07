import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class GetFilesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public readonly path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public readonly name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === "true";
  })
  public readonly shared: boolean;
}
