import {   IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class TolikeDto {
  @IsString()
  @IsOptional()
  articleId: string;

  @IsString()
  @IsOptional()
  commentId: string;


  // 1,文章 2,评论
  @IsNumber()
  @IsNotEmpty()
  type: number;
}