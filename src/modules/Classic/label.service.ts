/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from './entity/label.entity';
import { LabelDto} from './tag.dto';

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
}
