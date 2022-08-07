import { IsString, MaxLength } from "class-validator";

export class SeriesDto {
  @IsString()
  @MaxLength(30)
  title: string;

  @IsString()
  description: string;

  @IsString()
  background: string;

  @IsString()
  name: string;

}
