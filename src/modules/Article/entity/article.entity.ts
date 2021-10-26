import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, RelationId } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn("uuid")
  articleId: string;

  @Column()
  uid: string;

  @Column({ default: 1 })
  tid: string;

  @Column({ default: '' })
  title: string;

  @Column('text')
  content: string;

  @Column({ default: '作者很懒，没有留下什么' })
  brief: string;

  @Column({default:''})
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
  @Column({ type: 'double', default: 0})
  publishTime: number;

  // 访问次数
  @Column({ default: 0 })
  viewNum: number;

  // 访问次数
  @Column({ default: '' })
  rejectInfo: string;

  @ManyToOne(() => User, user => user.article)
  user: User;
}
