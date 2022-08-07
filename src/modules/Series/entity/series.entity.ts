import { Article } from 'src/modules/Article/entity/article.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Series {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  background: string;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  @OneToMany(() => Article, article => article.series)
  article: Article[];
}
