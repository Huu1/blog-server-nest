import { Article } from 'src/modules/Article/entity/article.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { Replay } from './replay.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  content: string;

  @Column({ default: 'on' })
  status: string;


  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  @ManyToOne(() => Article, article => article.comment)
  article: Article;

  @ManyToOne(() => User, user => user.comment)
  user: User;

  @OneToMany(() => Replay, replay => replay.comment)
  replay: Replay[];

}
