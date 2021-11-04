/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Echo, RCode } from 'src/common/constant/rcode';
import { getRepository, Repository } from 'typeorm';
import { Article } from '../Article/entity/article.entity';
import { User } from '../user/entity/user.entity';
import { CommentDto } from './comment.dto';
import { Comment } from './entity/comment.entity';
import { Replay } from './entity/replay.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Replay)
    private readonly replayRepository: Repository<Replay>,
  ) { }

  async addComment(commentDto: CommentDto, userId) {
    const { content, articleId } = commentDto;

    const article = await getRepository(Article)
      .createQueryBuilder("article")
      .where('article.articleId=:articleId', { articleId })
      .getOne();

    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where('user.userId=:userId', { userId })
      .getOne();

    const comment = new Comment();
    comment.content = content;
    comment.user = user;
    comment.article = article;
    await this.commentRepository.save(comment);

    return {};
  }

  async findArticleComment(articleId: string) {

    const article = await getRepository(Article)
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.comment", "comment")
      .leftJoinAndSelect("comment.replay", "replay")
      .leftJoinAndSelect("comment.user", "user")
      .leftJoinAndSelect("replay.user", "ruser")
      .where('article.articleId=:articleId', { articleId })
      .getOne();

    return {
      data: article.comment
    };
  }

  async replayComment(reply: any, userId: string) {
    const { content, commentId } = reply;

    const comment = await getRepository(Comment)
      .createQueryBuilder("comment")
      .where('comment.id=:id', { id:commentId })
      .getOne();

    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where('user.userId=:userId', { userId })
      .getOne();

    const replay = new Replay();
    replay.content = content;
    replay.user = user;
    replay.comment = comment;
    await this.replayRepository.save(replay);

    return {};
  }
}
