import { Injectable } from '@nestjs/common';
import { Repository, Like, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { Echo, RCode } from 'src/common/constant/rcode';
import { ArticleDto } from './article.dto';
import { JwtService } from '@nestjs/jwt';
import { createWriteStream } from 'fs';
import { join } from 'path';

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
  async userPublishArticle(article: ArticleDto, file) {
    const { articleId, tid, uid, brief } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, status: 1, uid });

    if (oldArticle) {
      let background;
      try {
        const random = Date.now() + '&';
        const stream = createWriteStream(join('public/article', random + file.originalname));
        stream.write(file.buffer);
        background = `public/article/${random}${file.originalname}`;
      } catch (error) {
        return { code: RCode.FAIL, msg: '上传图片失败' };
      }
      try {
        await this.articleRepository.update(oldArticle, { ...oldArticle, brief, background, tid, status: 2 });
        return new Echo(
          RCode.OK,
          null,
          '发布成功,待审核中'
        );
      } catch (error) {
        return { code: RCode.FAIL, msg: '发布失败' };
      }
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

  async getAllPublishArticle(data: any) {
    console.log(data);
    
    const { pageSize = 5, current = 1, uid } = data;
    const result = await getRepository(Article)
      .createQueryBuilder("result")
      .orderBy("result.createTime", "DESC")
      .where("result.status = :status", { status: 3 })
      .andWhere("result.uid = :uid", { uid })
      .skip(pageSize * (current - 1))
      .take(pageSize)
      .getManyAndCount();

    return new Echo(
      RCode.OK,
      {
        list: result[0],
        total: result[1],
        current,
        pageSize
      },
    );
  }

  async queryAll(data: any, uid: string) {
    const { current, pageSize, status, tid } = data;
    // status 0全部  1:草稿  2:待审核  3:已发布  4:驳回

    const result = await getRepository(Article)
      .createQueryBuilder("result")
      .orderBy("result.createTime", "DESC")
      .where("result.uid = :uid", { uid })
      .andWhere(status ? "result.status = :status" : "result.status != :status", { status })
      .andWhere(tid ? "result.tid = :tid" : "result.tid != :tid", { tid: tid + '' })
      .skip(pageSize * (current - 1))
      .take(pageSize)
      .getManyAndCount();

    return new Echo(
      RCode.OK,
      {
        list: result[0],
        total: result[1],
        current,
        pageSize
      },
    );
  }

  async getAllArticle(data) {
    const { current, pageSize, status, tid } = data;
    // status 0全部  1:草稿  2:待审核  3:已发布  4:驳回
    
    const result = await getRepository(Article)
      .createQueryBuilder("result")
      .orderBy("result.createTime", "DESC")
      .andWhere(status ? "result.status = :status" : "result.status != :status", { status })
      .andWhere(tid ? "result.tid = :tid" : "result.tid != :tid", { tid: tid + '' })
      .skip(pageSize * (current - 1))
      .take(pageSize)
      .getManyAndCount();

    return new Echo(
      RCode.OK,
      {
        list: result[0],
        total: result[1],
        current,
        pageSize
      },
    );
  }

  async setAudit(param) {
    const { articleId, status: auditStatus, info } = param;
    const target = await this.articleRepository.findOne({ status: 2, articleId });
    if (!target) {
      return new Echo(
        RCode.FAIL,
        null,
        '未找到此文章'
      );
    }

    const status = auditStatus === 1 ? 3 : 4;

    await this.articleRepository.update(target, { ...target, rejectInfo: info, status });
    return new Echo(
      RCode.OK,
      null,
    );

  }
}
