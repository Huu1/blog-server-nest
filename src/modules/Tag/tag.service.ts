import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Echo, RCode } from 'src/common/constant/rcode';
import { getRepository, Repository } from 'typeorm';
import { postStatus } from '../Article/article.dto';
import { Article } from '../Article/entity/article.entity';
import { Tag } from './entity/tag.entity';
import { TagDto } from './tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async createTag(data: TagDto) {
    try {
      const isHad = await this.tagRepository.findOne({ name: data.name });

      if (isHad) {
        return {
          code: 1,
          msg: 'tag name 已存在',
        };
      }

      const { title, description, background, name } = data;
      const tag = new Tag();

      tag.title = title;
      tag.description = description;
      tag.background = background;
      tag.name = name;

      const res = await this.tagRepository.save(tag);

      return {
        code: 0,
        msg: '操作成功',
        data: {
          id: res.id,
          title: res.title,
          description: res.description,
        },
      };
    } catch (error) {
      return new Echo(RCode.FAIL);
    }
  }
  async editTag(id: string, data: TagDto) {
    try {
      const tag = await this.tagRepository.findOne(id);

      if (!tag) {
        return {
          code: 1,
          msg: 'tag不存在',
        };
      }

      const isHad = await this.tagRepository.findOne({ name: data.name });
      

      if (isHad) {
        return {
          code: 1,
          msg: 'tag name 已存在',
        };
      }

      tag.background = data.background;
      tag.description = data.description;
      tag.title = data.title;
      tag.name = data.name;

      await this.tagRepository.save(tag);

      return new Echo(RCode.OK);
    } catch (error) {
      return new Echo(RCode.FAIL, null, error.toString());
    }
  }

  async getArticleList(name: string, pageSize, pageNumber) {
    try {
      const qb = () =>
        getRepository(Article)
          .createQueryBuilder('article')
          .leftJoinAndSelect('article.user', 'user')
          .leftJoinAndSelect('article.tag', 'tag')
          .leftJoinAndSelect('article.series', 'series')
          .where('tag.name=:name', { name })
          .andWhere('article.status = :status', { status: postStatus.publish });

      let data;
      if (pageSize && pageNumber) {
        const res = await qb()
          .skip(pageSize * (pageNumber - 1))
          .take(pageSize)
          .getManyAndCount();
        data = {
          list: res[0],
          total: res[1],
          pageNumber,
          pageSize,
        };
      } else {
        const res = await qb().getMany();
        data = {
          list: res,
        };
      }

      console.log(data);
      
      return {
        data,
        code: RCode.OK,
      };
    } catch (error) {
      return new Echo(RCode.FAIL, null, error.toString());
    }
  }

  async getAllTags() {
    try {
      const res = await getRepository(Tag)
        .createQueryBuilder('tag')
        .leftJoin('tag.article', 'article', 'article.status =:status', {
          status: postStatus.publish,
        })
        .addSelect('COUNT(articleId)', 'count')
        .groupBy('tag.id')
        .getRawMany();

      return new Echo(RCode.OK, res);
    } catch (error) {
      return new Echo(RCode.FAIL, null, error.toString());
    }
  }
}
