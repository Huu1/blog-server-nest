import { Injectable } from '@nestjs/common';
import { Repository, getRepository, getConnection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { Echo, RCode } from 'src/common/constant/rcode';
import { addArticleDto, ArticleDto, postStatus } from './article.dto';
import { createWriteStream } from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
import { Tag } from '../Classic/entity/tag.entity';
import { Label } from '../Classic/entity/label.entity';
import { User } from '../user/entity/user.entity';
import { ArticleContent } from './entity/articleContent.entity';
import { Meta, MetaType } from './entity/meta.entity';
// import { Like } from '../Like/entity/like.entity';

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
    @InjectRepository(Meta)
    private readonly metaRepository: Repository<Meta>,
  ) {}

  async findOneArticle(id: string) {
    const article = await this.articleRepository.findOne({
      relations: ['content', 'user', 'label', 'tag'],
      where: { articleId: id },
    });

    console.log(article);
    

    if (article) {
      let next, previous;
      if (article.status === postStatus.publish) {
        article.viewNum = article.viewNum + 1;
        await this.articleRepository.save(article);
        next = await getRepository(Article)
          .createQueryBuilder('article')
          .where('article.status = :status', { status: postStatus.publish })
          .orderBy('article.publishTime', 'DESC')
          .andWhere('article.publishTime < :publishTime', {
            publishTime: article.publishTime,
          })
          .limit(1)
          .getOne();
        previous = await getRepository(Article)
          .createQueryBuilder('article')
          .where('article.status = :status', { status: postStatus.publish })
          .orderBy('article.publishTime', 'ASC')
          .andWhere('article.publishTime > :publishTime', {
            publishTime: article.publishTime,
          })
          .limit(1)
          .getOne();
      }
      return new Echo(RCode.OK, { ...article, previous, next });
    } else {
      return new Echo(RCode.FAIL, article, '文章不存在');
    }
  }

  // 新建草稿
  async addArticle(articleDto: addArticleDto, uid: string) {
    try {
      const user = await this.userRepository.findOne({ userId: uid });

      const { title, content: contentData } = articleDto;
      const articleContent = new ArticleContent();
      articleContent.content = contentData;

      const article = new Article();
      article.user = user;
      article.title = title;
      article.content = articleContent;
      article.status = postStatus.draft;
      const res = await this.articleRepository.save(article);
      return new Echo(RCode.OK, {
        articleId: res.articleId,
        uid: res.user.userId,
        createTime: res.createTime,
      });
    } catch (error) {
      return new Echo(RCode.FAIL);
    }
  }

  async editArticle(articleDto: ArticleDto) {
    const { uid, title, content, articleId } = articleDto;
    try {
      await getRepository(Article)
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.user', 'user', 'user.userId=:userId', {
          userId: uid,
        })
        .update()
        .set({ title })
        .where('article.articleId=:articleId', { articleId })
        .execute();

      await getRepository(ArticleContent)
        .createQueryBuilder('content')
        .innerJoinAndSelect('content.article', 'article')
        .innerJoinAndSelect('article.user', 'user', 'user.userId=:userId', {
          userId: uid,
        })
        .update()
        .set({ content })
        .where('article.articleId=:articleId', { articleId })
        .execute();
      return new Echo(RCode.OK, null);
    } catch (error) {
      console.log(error);
      return new Echo(RCode.ERROR, null, '系统异常');
    }
  }

  async deleteArticle(article: any) {
    const { uid, articleId } = article;

    try {
      const article = await getRepository(Article)
        .createQueryBuilder('article')
        // 用户匹配
        .leftJoin('article.user', 'user', 'user.userId = :userId', {
          userId: uid,
        })
        .leftJoinAndSelect('article.content', 'content')
        // id匹配
        .where('article.articleId=:articleId', { articleId })

        // 是草稿
        .andWhere('article.status=:status', { status: postStatus.draft })
        .getOne();

      if (article) {
        await this.articleContentRepository.remove(article.content);
        await this.articleRepository.remove(article);
        return new Echo(RCode.OK, null);
      } else {
        return new Echo(RCode.FAIL, null, '文章不存在');
      }
    } catch (error) {
      console.log(error);
      return new Echo(RCode.ERROR, null, '系统异常');
    }
  }
  async delPublishArticle(articleId) {
    try {
      const article = await this.articleRepository.findOne({
        where: { articleId },
      });
      if (article && article.status === postStatus.publish) {
        article.status = postStatus.delete;
        await this.articleRepository.save(article);
        return {};
      } else {
        return new Echo(RCode.FAIL, null, '文章不存在');
      }
    } catch (error) {
      return new Echo(RCode.ERROR, null, '系统异常');
    }
  }

  async publishArticle(article: ArticleDto) {
    const { articleId } = article;

    const oldArticle = await this.articleRepository.findOne({
      articleId,
      status: postStatus.draft,
    });

    if (oldArticle) {
      await this.articleRepository.update(oldArticle, {
        ...oldArticle,
        status: postStatus.publish,
      });
      return new Echo(RCode.OK, null, '发布成功');
    } else {
      return new Echo(RCode.FAIL, null, '文章不存在');
    }
  }

  async userPublishArticle(article: any, file) {
    const { articleId, tid, uid, brief, labelId = [] } = article;

    const oldArticle = await getRepository(Article)
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .leftJoinAndSelect('article.content', 'content')
      .where('user.userId = :userId', { userId: uid })
      .andWhere('article.articleId = :articleId', { articleId })
      .andWhere('article.status = :status', { status: postStatus.draft })
      .getOne();

    if (!oldArticle) {
      return new Echo(RCode.FAIL, null, '文章不存在');
    }
    const hasTag = await this.tagRepository.findOne({ tagId: tid });
    if (!hasTag) {
      return new Echo(RCode.FAIL, null, 'tag不存在');
    }

    // 标签列表
    let LidList;
    const labelList = [];
    if (labelId) {
      try {
        LidList = JSON.parse(labelId);

        for await (const labelId of LidList) {
          const label = await this.labelRepository.findOne({ labelId });

          if (!label) {
            return new Echo(RCode.FAIL, null, '要添加的label不存在');
          }
          labelList.push(label);
        }
      } catch (error) {
        return new Echo(RCode.FAIL, null, 'label查询发生错误');
      }
    }

    if (oldArticle) {
      let background;
      if (file) {
        try {
          const random = Date.now() + '&';
          const stream = createWriteStream(
            path.resolve(__dirname, '../../../') +
              join('/public/article', random + file.originalname),
          );
          stream.write(file.buffer);
          background = `public/article/${random}${file.originalname}`;
        } catch (error) {
          return { code: RCode.FAIL, msg: '上传图片失败' };
        }
      }
      try {
        await getConnection().transaction(async transactionalEntityManager => {
          oldArticle.label = labelList;
          oldArticle.tag = hasTag;
          oldArticle.readTime = oldArticle.content.content.length / 500;
          await transactionalEntityManager.save(Article, {
            ...oldArticle,
            brief,
            publishTime: Date.now(),
            background,
            status: postStatus.publish,
          });
        });
      } catch (error) {
        return new Echo(RCode.FAIL, null, '发布异常');
      }
      return new Echo(RCode.OK, null, '发布成功');
    }
  }

  async getAllPublishArticle(data: any) {
    const { pageSize = 5, current = 1, tagId, title, labelId } = data;
    const qb = () => {
      return getRepository(Article)
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.user', 'user')
        .leftJoinAndSelect('article.label', 'label')
        .leftJoinAndSelect('article.tag', 'tag')
        .leftJoinAndSelect('article.meta', 'meta')
        .where('article.status = :status', { status: postStatus.publish });
    };
    let query;
    if (tagId) {
      query = qb().andWhere('tag.tagId=:tagId', { tagId });
    } else if (title) {
      query = qb().andWhere('article.title LIKE :title', {
        title: `%${title}%`,
      });
    } else if (labelId) {
      query = qb().andWhere('label.labelId=:labelId', { labelId });
    } else {
      query = qb();
    }

    const result = await query
      .orderBy('article.publishTime', 'DESC')
      .skip(pageSize * (current - 1))
      .take(pageSize)
      .getManyAndCount();

    return new Echo(RCode.OK, {
      list: result[0],
      total: result[1],
      current,
      pageSize,
    });
  }

  async queryAll(data: any, userId: string) {
    // status  1:草稿  2:已发布
    const { current, pageSize, status, tid } = data;

    let result;
    if (tid === '0') {
      result = await getRepository(Article)
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.user', 'user', 'user.userId = :userId', {
          userId,
        })
        .leftJoinAndSelect('result.tag', 'tag')
        .where('result.status = :status', { status })
        .orderBy('result.createTime', 'DESC')
        .skip(pageSize * (current - 1))
        .take(pageSize)
        .getManyAndCount();
    } else {
      result = await getRepository(Article)
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.user', 'user', 'user.userId = :userId', {
          userId,
        })
        .leftJoinAndSelect('result.tag', 'tag')
        .where('result.status = :status', { status })
        .andWhere('tag.tagId = :tagId', { tagId: tid })
        .orderBy('result.createTime', 'DESC')
        .skip(pageSize * (current - 1))
        .take(pageSize)
        .getManyAndCount();
    }

    return new Echo(RCode.OK, {
      list: result[0],
      total: result[1],
      current,
      pageSize,
    });
  }

  // async moments(data: any, files) {
  //   const { brief, tid = '1005', uid, type } = data;
  //   const user = await this.userRepository.findOne({ userId: uid });
  //   const tag = await this.tagRepository.findOne({ tagId: tid });

  //   const article = new Article();
  //   article.user = user;
  //   article.brief = brief;
  //   article.tag = tag;
  //   article.status = postStatus.publish;

  //   const metas = [];
  //   try {
  //     files.forEach(file => {
  //       const meta = new Meta();
  //       const random = Date.now() + '&';
  //       const stream = createWriteStream(
  //         path.resolve(__dirname, '../../../') +
  //           join('/public/article', random + file.originalname),
  //       );
  //       stream.write(file.buffer);
  //       meta.file = `public/article/${random}${file.originalname}`;
  //       meta.article = article;
  //       meta.type = type;
  //       metas.push(meta);
  //     });
  //     for await (const meta of metas) {
  //       await this.metaRepository.save(meta);
  //     }
  //     await this.articleRepository.save(article);
  //   } catch (error) {
  //     console.log(error);
  //     return { code: RCode.FAIL, msg: '上传失败' };
  //   }
  //   return {};
  // }
  async getAllDraft(userId: string) {
    console.log(userId);

    const res = await getRepository(Article)
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.user', 'user', 'user.userId = :userId', {
        userId,
      })
      .where('result.status = :status', { status: postStatus.draft })
      .orderBy('result.createTime', 'DESC')
      .getMany();

    return {
      data: res,
    };
  }

  async getNearby(id: string) {
    const target = await getRepository(Article)
      .createQueryBuilder('article')
      .where('article.status = :status', { status: postStatus.publish })
      .andWhere('article.articleId = :articleId', { articleId: id })
      .getOne();
    const { publishTime } = target;

    const next = await getRepository(Article)
      .createQueryBuilder('article')
      .where('article.status = :status', { status: postStatus.publish })
      .andWhere('article.publishTime < :publishTime', { publishTime })
      .limit(1)
      .getOne();
    const previous = await getRepository(Article)
      .createQueryBuilder('article')
      .where('article.status = :status', { status: postStatus.publish })
      .andWhere('article.publishTime > :publishTime', { publishTime })
      .limit(1)
      .getOne();

    return {
      data: {
        previous,
        next,
      },
    };
  }
}
