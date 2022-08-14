import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { ArticleContent } from './articleContent.entity';
import { Series } from 'src/modules/Series/entity/series.entity';
import { Tag } from 'src/modules/Tag/entity/tag.entity';
import { Media } from 'src/modules/media/entity/media.entity';
@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
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

  @OneToOne(() => Media)
  @JoinColumn()
  midia: Media;

  // 1:草稿   2：发布
  @Column({ default: 1 })
  status: number;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  // 发布时间
  @Column({ type: 'double', default: 0 })
  publishTime: number;

  // 访问次数
  @Column({ default: 0 })
  viewNum: number;

  // 阅读时间
  @Column({ default: 0 })
  readTime: number;

  @OneToOne(
    () => ArticleContent,
    content => content.article,
    {
      cascade: true,
    },
  )
  content: ArticleContent;

  // 用户
  @ManyToOne(
    () => User,
    user => user.article,
  )
  user: User;

  // 系列
  @ManyToOne(
    () => Series,
    series => series.article,
  )
  series: Series;
  // 系列排序
  @Column({ default: 0 })
  sort: number;

  // 标签
  @ManyToMany(
    () => Tag,
    Tag => Tag.article,
  )
  tag: Tag[];
}
