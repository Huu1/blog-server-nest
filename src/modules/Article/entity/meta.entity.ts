import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Article } from './article.entity';
export enum MetaType {
  img,
  gif,
  video,
  music
}

@Entity()
export class Meta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  file: string;

  // 0:图片 1：gif 2视频 3 音乐
  @Column({ default: 0 })
  type: number;

  @ManyToOne(() => Article, article => article.meta ,{
    cascade: true,
  })
  article: Article;
}
