import { IsNotEmptyObject, IsString, MaxLength } from 'class-validator';

export class SeriesDto {
  @IsString()
  @MaxLength(30)
  title: string;

  @IsString()
  description: string;

  @IsNotEmptyObject()
  media: {
    url: string;
    thumbUrl: string;
  };

  @IsString()
  name: string;
}
