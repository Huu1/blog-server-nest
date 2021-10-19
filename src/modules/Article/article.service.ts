import { Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { Echo, RCode } from 'src/common/constant/rcode';
import { ArticleDto } from './article.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) { }
  async findOneArticle(id: string) {
    const article = await this.articleRepository.findOne({ articleId: id });
    if (article) {
      return new Echo(
        RCode.OK,
        article,
      );
    } else {
      return new Echo(
        RCode.FAIL,
        article,
        '文章不存在'
      );
    }

  }

  async addArticle(article: ArticleDto) {
    const result = await this.articleRepository.save(article);
    return new Echo(
      RCode.OK,
      result,
    );
  }

  async editArticle(article: ArticleDto) {
    const { uid, title, content, articleId } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, uid });
    console.log(oldArticle);
    
    
    if (oldArticle) {
      await this.articleRepository.update(oldArticle, {
        title, content
      });
      return new Echo(
        RCode.OK,
        null,
      );
    } else {
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    }

  }
}
