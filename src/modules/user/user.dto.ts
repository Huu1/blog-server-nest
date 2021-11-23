import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class createUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  password: string;
}