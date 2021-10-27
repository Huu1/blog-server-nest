/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Echo, RCode } from 'src/common/constant/rcode';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { LabelService } from './label.service';
import { TagDto, LabelDto } from './tag.dto';
import { TagService } from './tag.service';

@Controller('classic')
export class ClassicController {
  constructor(private readonly tagService: TagService, private readonly labelService: LabelService) { }

  //添加一个 tag
  @Post('addTag')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  addTag(@Body() tag: TagDto) {
    return this.tagService.addTag(tag);
  }

  // 添加一个 label
  @Post('addLabel')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  addLabel(@Body() label: LabelDto) {
    return this.labelService.addLabel(label);
  }

  // 获取label下的所有文章
  @Get('label/:id')
  async getArticleBylabelId(@Param() { id }: any) {
    return  this.labelService.getArticleBylabelId(id);
  }


  // 获取tag下的所有文章
  @Get('tag/:id')
  async getArticleByTagId(@Param() { id }: any) {
    return  this.tagService.getArticleBylabelId(id);
  }
}
