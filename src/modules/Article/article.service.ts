import { Injectable } from '@nestjs/common';
import { Repository, getRepository, getConnection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { Echo, RCode } from 'src/common/constant/rcode';
import { addArticleDto, ArticleDto, postStatus } from './article.dto';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Tag } from '../Classic/entity/tag.entity';
import { Label } from '../Classic/entity/label.entity';
import { User } from '../user/entity/user.entity';
import { ArticleContent } from './entity/articleContent.entity';

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
    @InjectRepository(ArticleContent)
    private readonly articleContentRepository: Repository<ArticleContent>,
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
      const user = await this.userRepository.findOne({ userId: uid });
      if (!user) {
        return new Echo(
          RCode.FAIL,
          null,
          '用户不存在'
        );
      }
      const { title, content: contentData } = articleDto;
      const articleContent = new ArticleContent();
      articleContent.content = contentData;

      const article = new Article();
      article.user = user;
      article.title = title;
      article.content = articleContent;
      article.status = postStatus.draft;
      const res = await this.articleRepository.save(article);
      console.log(res);

      return new Echo(
        RCode.OK,
        {
          articleId: res.articleId,
          uid: res.user.userId,
          createTime: res.createTime,
        },
      );
    } catch (error) {
      console.log(error);

      return new Echo(
        RCode.FAIL,
      );
    }
  }

  async editArticle(articleDto: ArticleDto) {
    const { uid, title, content, articleId } = articleDto;
    try {
      // const articleContent = await getRepository(ArticleContent)
      //   .createQueryBuilder('content')

      //   //id匹配
      //   .leftJoinAndSelect('content.article', 'article', 'article.articleId=:articleId', { articleId })

      //   //用户匹配
      //   .innerJoin('article.user', 'user', 'user.userId = :userId', { userId: uid })

      //   //是草稿
      //   .where('article.status =:status', { status: postStatus.draft })
      //   .getOne();

      // const result = await getConnection().transaction(async transactionalEntityManager => {
      // await transactionalEntityManager.
      await getRepository(Article)
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.user', 'user', 'user.userId=:userId', { userId:uid })
        .update()
        .set({ title })
        .where('article.articleId=:articleId', { articleId })
        .execute();
      // await transactionalEntityManager.
      await getRepository(ArticleContent)
        .createQueryBuilder('content')
        .innerJoinAndSelect('content.article', 'article')
        .innerJoinAndSelect('article.user', 'user','user.userId=:userId', { userId: uid })
        .update()
        .set({ content })
        .where('article.articleId=:articleId', { articleId })
        // .andWhere()
        .execute();

      // if (articleContent) {
      //   articleContent.content = content;
      //   articleContent.article.title = title;
      //   await this.articleRepository.save(articleContent.article);
      //   await this.articleContentRepository.save(articleContent);
      //   return new Echo(
      //     RCode.OK,
      //     null,
      //   );
      // }
      // console.log(result);

      // else {
      return new Echo(
        RCode.FAIL,
        null,
        '23'
      );
      // }
    } catch (error) {
      console.log(error);
      return new Echo(
        RCode.ERROR,
        null,
        '系统异常'
      );
    }
  }

  async deleteArticle(article: any) {
    const { uid, articleId } = article;

    try {
      const article = await getRepository(Article)
        .createQueryBuilder('article')
        // 用户匹配
        .innerJoin('article.user', 'user', 'user.userId = :userId', { userId: uid })
        .innerJoinAndSelect('article.content', 'content')
        // id匹配
        .where('article.articleId=:articleId', { articleId })

        // 是草稿
        .andWhere('article.status=:status', { status: postStatus.draft })
        .getOne();

      console.log(article);

      if (article) {
        await this.articleRepository.remove(article);
        return new Echo(
          RCode.OK,
          null,
        );
      }
      else {
        return new Echo(
          RCode.FAIL,
          null,
          '文章不存在'
        );
      }
    } catch (error) {
      console.log(error);
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


    const oldArticle = await getRepository(Article)
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.user", "user")
      .where("user.userId = :userId", { userId: uid })
      .andWhere("article.articleId = :articleId", { articleId })
      .andWhere("article.status = :status", { status: postStatus.draft })
      .getOne();

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
    let LidList;
    const labelList = [];
    if (labelId) {
      try {
        LidList = JSON.parse(labelId);

        for (const labelId of LidList) {
          const label = await this.labelRepository.findOne({ labelId });

          if (!label) {
            return new Echo(
              RCode.FAIL,
              null,
              '要添加的label不存在'
            );
          }
          labelList.push(label);
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
          oldArticle.label = labelList;
          oldArticle.tag = hasTag;
          await transactionalEntityManager.save(Article, { ...oldArticle, brief, background, status: postStatus.pendingCheck });
        });
      } catch (error) {
        console.log(error);

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
      // .leftJoinAndSelect("article.tag", "tag")
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
      .leftJoinAndSelect("article.label", "label")
      .leftJoinAndSelect("article.tag", "tag")
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

    let result;
    if (tid) {
      result = await getRepository(Article)
        .createQueryBuilder("result")
        .innerJoinAndSelect('result.user', 'user', 'user.userId = :userId', { userId })
        .innerJoinAndSelect('result.tag', 'tag', 'tag.tagId = :tagId', { tagId: tid })
        .where(status ? "result.status = :status" : "result.status != :status", { status })
        .orderBy("result.createTime", "DESC")
        .skip(pageSize * (current - 1))
        .take(pageSize)
        .getManyAndCount();
    } else {
      result = await getRepository(Article)
        .createQueryBuilder("result")
        .innerJoinAndSelect('result.user', 'user', 'user.userId = :userId', { userId })
        .leftJoinAndSelect('result.tag', 'tag')
        .where(status ? "result.status = :status" : "result.status != :status", { status })
        .orderBy("result.createTime", "DESC")
        .skip(pageSize * (current - 1))
        .take(pageSize)
        .getManyAndCount();
    }

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
      .leftJoinAndSelect('result.user', 'user')
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
