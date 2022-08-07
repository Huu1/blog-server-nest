/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Echo, RCode } from 'src/common/constant/rcode';
import { getRepository, Repository } from 'typeorm';
import { postStatus } from '../Article/article.dto';
import { Article } from '../Article/entity/article.entity';
import { Series } from './entity/series.entity';
import { SeriesDto } from './series.dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
  ) {}

  async createSeries(data: SeriesDto) {
    try {
      const isHad = await this.seriesRepository.findOne({ name: data.name });

      if (isHad) {
        return {
          code: 1,
          msg: '系列 name 已存在',
        };
      }

      const { title, description, background, name } = data;
      const newSeries = new Series();

      newSeries.title = title;
      newSeries.description = description;
      newSeries.background = background;
      newSeries.name = name;

      const res = await this.seriesRepository.save(newSeries);

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
  async editSeries(id: string, data: SeriesDto) {
    try {
      const series = await this.seriesRepository.findOne(id);

      if (!series) {
        return {
          code: 1,
          msg: '系列不存在',
        };
      }

      const isHad = await this.seriesRepository.findOne({ name: data.name });
      if (series.name !== data.name && isHad) {
        return {
          code: 1,
          msg: '系列 name 已存在',
        };
      }

      series.background = data.background;
      series.description = data.description;
      series.title = data.title;
      series.name = data.name;

      await this.seriesRepository.save(series);

      return new Echo(RCode.OK);
    } catch (error) {
      return new Echo(RCode.FAIL, null, error.toString());
    }
  }
  async getArticle(name: string, articleId: string) {
    try {
      const article = await getRepository(Article)
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.user', 'user')
        .leftJoinAndSelect('article.tag', 'tag')
        .leftJoinAndSelect('article.series', 'series')
        .leftJoinAndSelect('article.content', 'content')
        .where('series.name=:name', { name })
        .andWhere('article.articleId = :articleId', { articleId })
        .andWhere('article.status = :status', { status: postStatus.publish })
        .getOne();

      if (article) {
        return {
          data: article,
          code: RCode.OK,
        };
      } else {
        return {
          data: article,
          msg: '未找到此文章',
          code: RCode.OK,
        };
      }
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
          .where('series.name=:name', { name })
          .andWhere('article.status = :status', { status: postStatus.publish })
          .orderBy('article.sort', 'DESC');

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
        const series = await this.seriesRepository.findOne({ name });
        data = {
          list: res,
          series,
        };
      }
      return {
        data,
        code: RCode.OK,
      };
    } catch (error) {
      return new Echo(RCode.FAIL, null, error.toString());
    }
  }

  async getAllSeries() {
    try {
      const res = await getRepository(Series)
        .createQueryBuilder('series')
        .leftJoin('series.article', 'article', 'article.status =:status', {
          status: postStatus.publish,
        })
        .addSelect('COUNT(articleId)', 'count')
        .groupBy('series.id')
        .getRawMany();

      return new Echo(RCode.OK, res);
    } catch (error) {
      return new Echo(RCode.FAIL, null, error.toString());
    }
  }
}
