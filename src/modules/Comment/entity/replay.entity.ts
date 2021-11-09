import { Article } from 'src/modules/Article/entity/article.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class Replay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  content: string;

  @Column({ default: 'on' })
  status: string;


  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  @ManyToOne(() => Comment, comment => comment.replay)
  comment: Comment;

  @ManyToOne(() => User, user => user.comment)
  user: User;

  @ManyToOne(() => User)
  toUser: User;

  @ManyToOne(() => Replay)
  toReplay: Replay;
}
