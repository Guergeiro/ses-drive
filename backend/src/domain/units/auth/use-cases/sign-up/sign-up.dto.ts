import { IsPassword } from "@generics/PasswordValidator.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, Length } from "class-validator";

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  public readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 255)
  public readonly fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPassword()
  public readonly password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPassword()
  public readonly confirmPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  public readonly terms: boolean;
}
