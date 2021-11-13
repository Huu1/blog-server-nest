import { Article } from 'src/modules/Article/entity/article.entity';
import { Comment } from 'src/modules/Comment/entity/comment.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double', default: new Date().valueOf() })
  createTime: number;

  @ManyToOne(() => Article, article => article.comment, {
    cascade: true,
  })
  article: Article;

  // @ManyToOne(() => User, user => user.like, {
  //   cascade: true,
  // })
  // user: User;

  // @ManyToOne(() => Comment, comment => comment.like, {
  //   cascade: true,
  // })
  // comment: Comment;
}
