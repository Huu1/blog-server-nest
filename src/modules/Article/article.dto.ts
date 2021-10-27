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
  // 1:草稿  2:待审核  3:已发布  4:驳回
  idle,
  draft,
  pendingCheck,
  publish,
  reject,
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
  @MaxLength(50)
  @IsNotEmpty()
  brief;

  @IsString()
  @IsNotEmpty()
  labelId;
}