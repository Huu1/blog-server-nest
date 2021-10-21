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
      if (article.status === 3) {
        await this.articleRepository.update(article, { ...article, viewNum: article.viewNum + 1 });
      }
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
    const result = await this.articleRepository.save({ ...article, status: 1 });
    return new Echo(
      RCode.OK,
      {
        articleId: result.articleId,
        uid: result.uid,
        createTime: result.createTime,
      },
    );
  }

  async editArticle(article: ArticleDto) {
    const { uid, title, content, articleId } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, uid, status: 1 });

    if (oldArticle) {
      await this.articleRepository.update(oldArticle, {
        title, content, lastUpdateTime: new Date().valueOf()
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

  async deleteArticle(article: any) {
    const { uid, articleId } = article;

    console.log(uid, articleId);

    const target = await this.articleRepository.findOne({ articleId, uid, status: 1 });

    if (target) {
      await this.articleRepository.remove(target);
      return new Echo(
        RCode.OK,
        null,
        '删除成功'
      );
    } else {
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    }

  }

  async backArticle(article: ArticleDto) {
    const { articleId } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, status: 3 });

    if (oldArticle) {
      await this.articleRepository.update(oldArticle, { ...oldArticle, status: 2 });
      return new Echo(
        RCode.OK,
        null,
        '下架成功'
      );
    } else {
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    }

  }

  async publishArticle(article: ArticleDto) {
    const { articleId } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, status: 2 });

    if (oldArticle) {
      await this.articleRepository.update(oldArticle, { ...oldArticle, status: 3 });
      return new Echo(
        RCode.OK,
        null,
        '发布成功'
      );
    } else {
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    }

  }
  async userPublishArticle(article: ArticleDto) {
    const { articleId, background, tid } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, status: 1, uid: article.uid });

    if (oldArticle) {
      await this.articleRepository.update(oldArticle, { ...oldArticle, background, tid, status: 2 });
      return new Echo(
        RCode.OK,
        null,
        '发布成功,待审核中'
      );
    } else {
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    }
  }

  async getAllDraft(uid: string) {
    const list = await this.articleRepository.find({ uid, status: 1 });

    return new Echo(
      RCode.OK,
      list,
    );
  }

  async getAllPublishArticle(uid: string) {
    const list = await this.articleRepository.find({ uid, status: 3 });

    return new Echo(
      RCode.OK,
      list,
    );
  }
}
