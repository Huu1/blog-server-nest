import { Article } from 'src/modules/Article/entity/article.entity';
import { Entity, Column, PrimaryGeneratedColumn,  ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Tag {
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

  @ManyToMany(() => Article, (article) => article.tag)
  @JoinTable()
  article: Article[];
}
