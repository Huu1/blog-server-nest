import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ default: '' })
  content: string;

  @Column({ default: 'chenguanxi.png' })
  brief: string;

  @Column({  })
  background: string;

  // 1:草稿  2:待审核  3:已发布  4:驳回
  @Column({ default: 1 })
  status: number;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  // 最后编辑时间
  @Column({ type: 'double', default: new Date().valueOf() })
  lastUpdateTime: number;

  // 访问次数
  @Column({ default: 0 })
  viewNum: number;
}
