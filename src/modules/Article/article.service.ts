import { Injectable } from '@nestjs/common';
import { Repository, Like, getRepository, getConnection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { Echo, RCode } from 'src/common/constant/rcode';
import { ArticleDto, postStatus } from './article.dto';
import { JwtService } from '@nestjs/jwt';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Tag } from '../Classic/entity/tag.entity';
import { Label } from '../Classic/entity/label.entity';
import { LabelMap } from '../Classic/entity/labelMap.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    @InjectRepository(LabelMap)
    private readonly LabelMapRepository: Repository<LabelMap>,
  ) { }
  async findOneArticle(id: string) {
    const article = await this.articleRepository.findOne({ articleId: id });
    if (article) {
      if (article.status === postStatus.publish) {
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
    const result = await this.articleRepository.save({ ...article, status: postStatus.draft });
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

    const oldArticle = await this.articleRepository.findOne({ articleId, uid, status: postStatus.draft });

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

    const target = await this.articleRepository.findOne({ articleId, uid, status: postStatus.draft });

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

  // async backArticle(article: ArticleDto) {
  //   const { articleId } = article;

  //   const oldArticle = await this.articleRepository.findOne({ articleId, status: 3 });

  //   if (oldArticle) {
  //     await this.articleRepository.update(oldArticle, { ...oldArticle, status: 2 });
  //     return new Echo(
  //       RCode.OK,
  //       null,
  //       '下架成功'
  //     );
  //   } else {
  //     return new Echo(
  //       RCode.FAIL,
  //       null,
  //       '文章不存在'
  //     );
  //   }
  // }

  async publishArticle(article: ArticleDto) {
    const { articleId } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, status: postStatus.pendingCheck });

    if (oldArticle) {
      await this.articleRepository.update(oldArticle, { ...oldArticle, status: postStatus.publish });
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

  async userPublishArticle(article: any, file) {
    const { articleId, tid, uid, brief, labelId = [] } = article;

    const oldArticle = await this.articleRepository.findOne({ articleId, status: postStatus.draft, uid });
    if (!oldArticle) {
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    }
    const hasTag = await this.tagRepository.findOne({ tagId: tid });
    if (!hasTag) {
      return new Echo(
        RCode.FAIL,
        null,
        'tag不存在'
      );
    }

    // 标签列表
    let LidList
    if (labelId) {
      try {
        console.log(labelId);

        LidList = JSON.parse(labelId)

        for (const labelId of LidList) {
          const isHas = await this.labelRepository.findOne({ labelId });

          if (!isHas) {
            return new Echo(
              RCode.FAIL,
              null,
              '要添加的label不存在'
            );
          }
        }
      } catch (error) {
        return new Echo(
          RCode.FAIL,
          null,
          'label查询发生错误'
        );
      }
    }

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
        await getConnection().transaction(async transactionalEntityManager => {
          for (const labelId of LidList) {
            await transactionalEntityManager.save(LabelMap, { articleId, labelId, createTime: Date.now() })
          }
          await transactionalEntityManager.save(Article, { ...oldArticle, brief, background, tid, status: postStatus.pendingCheck })
        });
      } catch (error) {
        return new Echo(
          RCode.FAIL,
          null,
          '发布异常'
        );
      }
      return new Echo(
        RCode.OK,
        null,
        '发布成功,待审核中'
      );
    }
  }

  async getAllDraft(uid: string) {
    const list = await this.articleRepository.find({ uid, status: postStatus.draft });

    return new Echo(
      RCode.OK,
      list,
    );
  }

  async getAllPublishArticle(data: any) {

    const { pageSize = 5, current = 1, uid } = data;
    const result = await getRepository(Article)
      .createQueryBuilder("result")
      .orderBy("result.createTime", "DESC")
      .where("result.status = :status", { status: postStatus.publish })
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
    const target = await this.articleRepository.findOne({ status: postStatus.pendingCheck, articleId });
    if (!target) {
      return new Echo(
        RCode.FAIL,
        null,
        '未找到此文章'
      );
    }

    const status = auditStatus === 1 ? postStatus.publish : postStatus.reject;

    await this.articleRepository.update(target, { ...target, rejectInfo: info, status });
    return new Echo(
      RCode.OK,
      null,
    );

  }
}
