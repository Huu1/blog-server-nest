import { Injectable } from '@nestjs/common';
import { Repository, Like, getRepository, getConnection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { Echo, RCode } from 'src/common/constant/rcode';
import { addArticleDto, ArticleDto, postStatus } from './article.dto';
import { JwtService } from '@nestjs/jwt';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Tag } from '../Classic/entity/tag.entity';
import { Label } from '../Classic/entity/label.entity';
import { LabelMap } from '../Classic/entity/labelMap.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    @InjectRepository(LabelMap)
    private readonly LabelMapRepository: Repository<LabelMap>,
  ) { }

  async findOneArticle(id: string) {
    const article = await this.articleRepository.findOne({ articleId: id }, { relations: ['user'] });
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

  async addArticle(articleDto: addArticleDto, uid: string) {
    try {
      const article = new Article();
      article.title = articleDto.title;
      article.content = articleDto.content;
      article.status = postStatus.draft;
      article.user = await this.userRepository.findOne({ userId: uid });
      const res = await this.articleRepository.save(article);
      return new Echo(
        RCode.OK,
        {
          articleId: res.articleId,
          uid: res.user.userId,
          createTime: res.createTime,
        },
      );
    } catch (error) {
      return new Echo(
        RCode.FAIL,
      );
    }
  }

  async editArticle(articleDto: ArticleDto) {
    const { uid, title, content, articleId } = articleDto;
    try {
      const article = await this.articleRepository.findOne({ articleId, status: postStatus.draft }, { relations: ["user"] });
      if (article && article.user.userId === uid) {
        await this.articleRepository.update(article, {
          title, content, lastUpdateTime: new Date().valueOf()
        });
        return new Echo(
          RCode.OK,
          null,
        );
      }
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    } catch (error) {
      return new Echo(
        RCode.ERROR,
        null,
        '系统异常'
      );
    }
  }

  async deleteArticle(article: any) {
    const { uid, articleId } = article;

    // 需要移除文章对应的 map  未完成
    try {
      const article = await this.articleRepository.findOne({ articleId, status: postStatus.draft }, { relations: ["user"] });
      if (article && article.user.userId === uid) {
        await this.articleRepository.remove(article);
        return new Echo(
          RCode.OK,
          null,
        );
      }
      return new Echo(
        RCode.FAIL,
        null,
        '文章不存在'
      );
    } catch (error) {
      return new Echo(
        RCode.ERROR,
        null,
        '系统异常'
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

  async getAllDraft(userId: string) {
    const user = await getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.article", "article", 'article.status= :status', { status: postStatus.draft })
      .where("user.userId = :userId", { userId })
      .orderBy("article.createTime", "DESC")
      .getOne();

    return new Echo(
      RCode.OK,
      user.article || []
    );
  }

  async getAllPublishArticle(data: any) {
    const { pageSize = 5, current = 1, uid } = data;

    const result = await getRepository(Article)
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.user", "user")
      .where("user.userId = :userId", { userId: uid })
      .andWhere("article.status = :status", { status: postStatus.publish })
      .orderBy("article.createTime", "DESC")
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

  async queryAll(data: any, userId: string) {
    // status 0全部  1:草稿  2:待审核  3:已发布  4:驳回
    const { current, pageSize, status, tid } = data;
    const result = await getRepository(Article)
      .createQueryBuilder("result")
      .innerJoinAndSelect('result.user', 'user', 'user.userId = :userId', { userId })
      .andWhere(status ? "result.status = :status" : "result.status != :status", { status })
      .andWhere(tid ? "result.tid = :tid" : "result.tid != :tid", { tid: tid + '' })
      .orderBy("result.createTime", "DESC")
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
      .leftJoinAndSelect('result.user','user')
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
