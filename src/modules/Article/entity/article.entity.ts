import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn("uuid")
  articleId: string;

  @Column()
  uid: string;

  @Column()
  tid: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  content: string;

  @Column({ default: 'chenguanxi.png' })
  brief: string;

  @Column({ default: 'user' })
  background: string;

  @Column({ default: 'on' })
  status: string;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;
}
