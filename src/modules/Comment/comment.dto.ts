import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  articleId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  content: string;

}


export class ReplayDto {
  @IsString()
  @IsNotEmpty()
  commentId: string;

  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  content: string;

  toUid: string;
}