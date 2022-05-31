import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";

export enum Type {
  VIEW = "view",
  EDIT = "edit",
  REVOKE = "revoke",
}

export class ShareDirectoryDto {
  @ApiProperty({
    enum: Type,
  })
  @IsEnum(Type)
  public readonly type!: Type;

  @ApiProperty()
  @IsString()
  public readonly userId: string;
}
