import { IsString, MaxLength } from "class-validator";

export class TagDto {
  @IsString()
  @MaxLength(30)
  title: string;

  @IsString()
  description: string;

  @IsString()
  name: string;

}
