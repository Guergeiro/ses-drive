import { IsPassword } from "@generics/PasswordValidator.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPassword()
  public readonly password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPassword()
  public readonly confirmPassword: string;
}
