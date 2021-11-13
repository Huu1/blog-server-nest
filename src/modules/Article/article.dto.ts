import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ArticleDto {
  title: string;
  content: string;
  brief: string;
  background: string;
  tid: string;
  uid: string;
  articleId: string;
}

export enum postStatus {
  // 1:草稿  2:已发布  
  draft,
  publish,
}

export class addArticleDto {
  // @IsString()
  // @MaxLength(30)
  title: string;

  // @IsString()
  content: string;
}

export class publishDto {
  @IsString()
  @IsNotEmpty()
  articleId: string;

  @IsString()
  @IsNotEmpty()
  tid;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  brief;

  @IsString()
  @IsNotEmpty()
  labelId;
}