import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
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
  @Type(() => Boolean)
  public readonly shared: boolean = false;
}
