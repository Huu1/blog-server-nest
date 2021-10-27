/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Echo, RCode } from 'src/common/constant/rcode';
import { getRepository, Repository } from 'typeorm';
import { postStatus } from '../Article/article.dto';
import { Article } from '../Article/entity/article.entity';
import { Label } from './entity/label.entity';
import { LabelDto } from './tag.dto';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) { }

  async addLabel(label: LabelDto) {
    const { title } = label;
    const has = await this.labelRepository.findOne({ title });
    if (has) {
      return {
        msg: '标题已存在',
        data: {},
        code: 1
      };
    } else {
      this.labelRepository.save(label);
      return {
        msg: "操作成功"
      };
    }
  }

  async getArticleBylabelId(labelId: string) {
    const res = await getRepository(Label)
      .createQueryBuilder('label')
      .leftJoinAndSelect('label.article', 'article', 'article.status =:status', { status: postStatus.publish })
      .innerJoinAndSelect('article.user', 'user')
      .leftJoinAndSelect('article.tag', 'tag')
      .where('label.labelId = :labelId', { labelId })
      .getOne();

    return new Echo(
      RCode.OK,
      res
    );
  }
}
