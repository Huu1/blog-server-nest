import { IsArray, IsNotEmpty, IsNumber, isNumber, IsString, IS_ALPHA, MaxLength } from "class-validator";

export class ArticleDto {
  title: string;
  content: string;
  brief: string;
  background: string;
  tid: string;
  uid: string;
  articleId: string;
}

export class deleteArticlePublishDto {
  @IsString()
  @IsNotEmpty()
  articleId: string;
}

export enum postStatus {
  // 0:     1:草稿            2:已发布  
  delete, 
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

export class momentsDto {
  @IsString()
  type: string;
}

export class publishDto {
  @IsString()
  @IsNotEmpty()
  articleId: string;

  // @IsString()
  // @IsNotEmpty()
  // tid;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  brief;

  @IsArray()
  @IsNotEmpty()
  labelIds;
}