/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Echo, RCode } from 'src/common/constant/rcode';
import { getRepository, Repository } from 'typeorm';
import { postStatus } from '../Article/article.dto';
import { Tag } from './entity/tag.entity';
import { TagDto } from './tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async addTag(tag: TagDto) {
    const { title } = tag;
    const alreadyTag = await this.tagRepository.findOne({ title });
    if (alreadyTag) {
      return {
        msg: '标题已存在',
        code: 1,
      };
    } else {
      const { tagId } = await this.tagRepository.save(tag);
      return {
        data: tagId,
        msg: '操作成功',
      };
    }
  }

  async delTag(tagId) {
    const alreadyTag = await this.tagRepository.findOne({ tagId });

    if (alreadyTag) {
      try {
        await this.tagRepository.remove(alreadyTag);
        return {};
      } catch (error) {
        return {
          code: RCode.FAIL,
          msg: '删除失败',
        };
      }
    } else {
      return {
        code: RCode.FAIL,
        msg: '不存在',
      };
    }
  }

  async CountArticleOfTag() {
    const res = await getRepository(Tag)
      .createQueryBuilder('tag')
      .leftJoin('tag.article', 'article','article.status =:status', { status: postStatus.publish })
      // .select('tag.title', 'title')
      .addSelect('tag.tagId', 'id')
      .addSelect('COUNT(articleId)', 'count')
      .groupBy('tag.tagId')
      .getRawMany();

    return new Echo(RCode.OK, res);
  }

  async getAllTag() {
    const res = await getRepository(Tag)
      .createQueryBuilder('tag')
      // .select(['tag.tagId', 'tag.title'])
      .getMany();

    return new Echo(RCode.OK, res);
  }

  async getArticleByTagId(title: string) {
    const res = await getRepository(Tag)
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.article', 'article', 'article.status =:status', {
        status: postStatus.publish,
      })
      .leftJoinAndSelect('article.label', 'label')
      .where('tag.title = :title', { title })
      .orderBy('article.publishTime', 'ASC')
      .getOne();

    return new Echo(RCode.OK, res);
  }
}
