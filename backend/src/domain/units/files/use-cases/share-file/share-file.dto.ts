import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum } from "class-validator";

export enum Type {
  VIEW = "view",
  EDIT = "edit",
  REVOKE = "revoke",
}

export class ShareFileDto {
  @ApiProperty({
    enum: Type,
  })
  @IsEnum(Type)
  public readonly type!: Type;

  @ApiProperty()
  @IsEmail()
  public readonly userEmail: string;
}
