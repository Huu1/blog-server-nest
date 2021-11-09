import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';

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

  // @ManyToOne(() => Article, article => article.comment, {
  //   cascade: true,
  // })
  // article: Article;

  // @ManyToOne(() => User, user => user.comment)
  // user: User;
}
