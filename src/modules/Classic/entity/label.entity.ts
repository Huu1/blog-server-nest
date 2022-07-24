import { Article } from 'src/modules/Article/entity/article.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Label {
  @PrimaryGeneratedColumn("uuid")
  labelId: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  content: string;

  @Column({ default: 'on' })
  status: string;

  @Column({ default: 'magenta' })
  color: string;

  @Column({ default: '' })
  background: string;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  @ManyToMany(() => Article, (article) => article.label)
  @JoinTable()
  article: Article[];
}
