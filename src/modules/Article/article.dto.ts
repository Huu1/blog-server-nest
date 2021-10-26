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