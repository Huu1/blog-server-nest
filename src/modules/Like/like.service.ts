/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { Article } from '../Article/entity/article.entity';
import { User } from '../user/entity/user.entity';
import { Like } from './entity/like.entity';
import { TolikeDto } from './like.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async toLike(tolikeDto: TolikeDto, userId: string) {
    const { type, commentId, articleId } = tolikeDto;
    // const article = await getRepository(Article)
    //   .createQueryBuilder("article")
    if (type === 1) {
      const like = new Like();
      const article = await this.articleRepository.findOne({ where: { articleId }, relations: ['like'] });
      const user = await this.userRepository.findOne({ where: { userId }, relations: ['like'] });
      const hasLike = await getRepository(Like)
        .createQueryBuilder("like")
        .innerJoinAndSelect('like.user', 'user', 'user.userId =:userId', { userId })
        .innerJoinAndSelect('like.article', 'article', 'article.articleId =:articleId', { articleId })
        .getOne();

      if (article) {
        if (hasLike) {
          this.likeRepository.remove(hasLike);
          return {
            code: 0,
            msg: "已取消点赞"
          };
        }
        like.article = article;
        like.user = user;
        this.likeRepository.save(like);
        return {
          code: 0,
          msg: "点赞成功"
        };
      } else {
        return {
          code: 1,
          msg: "文章不存在"
        };
      }
      return {
        data: article
      };
    } else if (type === 2) {

    } else {
      return {
        code: 1,
        msg: "type 为1或者2"
      };
    }
  }
}
