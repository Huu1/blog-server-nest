/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entity/tag.entity';
import { TagDto } from './tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) { }

  async addTag(tag: TagDto) {
    const { title } = tag;
    const alreadyTag = await this.tagRepository.findOne({ title });
    if (alreadyTag) {
      return {
        msg: '标题已存在',
        data: {},
        code: 1
      };
    } else {
      this.tagRepository.save(tag);
      return {
        msg: "操作成功"
      };
    }
  }
}
