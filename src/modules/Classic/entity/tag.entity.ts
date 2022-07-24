import { Article } from 'src/modules/Article/entity/article.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  tagId: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  content: string;

  @Column({ default: 'on' })
  status: string;

  @Column({ default: '' })
  background: string;
  
  @Column({ default: 'magenta' })
  color: string;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  @OneToMany(() => Article, article => article.tag)
  article: Article[];
}
