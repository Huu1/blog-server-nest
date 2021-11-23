import { Article } from 'src/modules/Article/entity/article.entity';
import { Comment } from 'src/modules/Comment/entity/comment.entity';
import { Replay } from 'src/modules/Comment/entity/replay.entity';
import { Like } from 'src/modules/Like/entity/like.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId: string;

  @Column({ default: '' })
  username: string;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '', select: false })
  password: string;

  @Column({ default: 'chenguanxi.png' })
  avatar: string;

  @Column({ default: 'user' })
  role: string;

  // 1启动 0禁用
  @Column({ default: 1 })
  status: number;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  @OneToMany(() => Article, article => article.user)
  article?: Article[];

  @OneToMany(() => Comment, comment => comment.user)
  comment?: Comment[];

  @OneToMany(() => Replay, replay => replay.user)
  replay?: Replay[];

  // @OneToMany(() => Like, like => like.user)
  // like: Like[];
}
