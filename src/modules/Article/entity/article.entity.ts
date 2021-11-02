import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, OneToOne, JoinColumn } from 'typeorm';
import { Label } from 'src/modules/Classic/entity/label.entity';
import { Tag } from 'src/modules/Classic/entity/tag.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { ArticleContent } from './articleContent.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn("uuid")
  articleId: string;

  // 文章标题
  @Column({ default: '' })
  title: string;

  // 文章描述
  @Column({ default: '作者很懒，没有留下什么' })
  brief: string;

  // 文章主图
  @Column({ default: '' })
  background: string;

  // 1:草稿  2:待审核  3:已发布  4:驳回
  @Column({ default: 1 })
  status: number;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  // 最后编辑时间
  @Column({ type: 'double', default: new Date().valueOf() })
  lastUpdateTime: number;

  // 发布时间
  @Column({ type: 'double', default: 0 })
  publishTime: number;

  // 访问次数
  @Column({ default: 0 })
  viewNum: number;

  @Column({ default: '' })
  rejectInfo: string;

  @Column({ default: 1 })
  readTime: number;

  @OneToOne(() => ArticleContent, content => content.article, {
    cascade: true,
  })
  content: ArticleContent;

  // 用户
  @ManyToOne(() => User, user => user.article)
  user: User;

  // 分类
  @ManyToOne(() => Tag, tag => tag.article)
  tag: Tag;

  // 标签
  @ManyToMany(() => Label, (Label) => Label.article)
  label: Label[];
}
