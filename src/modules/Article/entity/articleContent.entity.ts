import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class ArticleContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  content: string;

  @OneToOne(() => Article, article => article.content)
  @JoinColumn()
  article: Article;
}
